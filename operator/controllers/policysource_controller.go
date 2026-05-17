package controllers

import (
	"bytes"
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	git "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/util/yaml"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

const fieldOwner = "secure-policy-operator"

type PolicySourceReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

func (r *PolicySourceReconciler) Reconcile(ctx context.Context, req reconcile.Request) (reconcile.Result, error) {
	source := policySourceObject()
	if err := r.Get(ctx, req.NamespacedName, source); err != nil {
		return reconcile.Result{}, client.IgnoreNotFound(err)
	}

	repoURL, _, _ := unstructured.NestedString(source.Object, "spec", "repositoryUrl")
	revision, _, _ := unstructured.NestedString(source.Object, "spec", "revision")
	policyPath, _, _ := unstructured.NestedString(source.Object, "spec", "path")
	if revision == "" {
		revision = "main"
	}
	if policyPath == "" {
		policyPath = "policies"
	}

	if repoURL == "" {
		return reconcile.Result{}, r.updateStatus(ctx, source, revision, "Ready", "False", "MissingRepository", "spec.repositoryUrl is required")
	}

	tmpDir, err := os.MkdirTemp("", "policy-source-*")
	if err != nil {
		return reconcile.Result{}, err
	}
	defer os.RemoveAll(tmpDir)

	if err := clonePolicyRepository(ctx, repoURL, revision, tmpDir); err != nil {
		statusErr := r.updateStatus(ctx, source, revision, "Ready", "False", "CloneFailed", err.Error())
		return reconcile.Result{}, firstError(err, statusErr)
	}

	applied, err := r.applyPolicyManifests(ctx, filepath.Join(tmpDir, policyPath))
	if err != nil {
		statusErr := r.updateStatus(ctx, source, revision, "Ready", "False", "ApplyFailed", err.Error())
		return reconcile.Result{}, firstError(err, statusErr)
	}

	message := "Applied policy resources"
	if applied == 0 {
		message = "No Gatekeeper policy resources found"
	}
	return reconcile.Result{}, r.updateStatus(ctx, source, revision, "Ready", "True", "PoliciesApplied", message)
}

func clonePolicyRepository(ctx context.Context, repoURL string, revision string, targetDir string) error {
	_, err := git.PlainCloneContext(ctx, targetDir, false, &git.CloneOptions{
		URL:           repoURL,
		ReferenceName: plumbing.NewBranchReferenceName(revision),
		SingleBranch:  true,
		Depth:         1,
	})
	if err == nil {
		return nil
	}

	repository, cloneErr := git.PlainCloneContext(ctx, targetDir, false, &git.CloneOptions{
		URL:   repoURL,
		Depth: 1,
	})
	if cloneErr != nil {
		return err
	}

	worktree, worktreeErr := repository.Worktree()
	if worktreeErr != nil {
		return worktreeErr
	}
	return worktree.Checkout(&git.CheckoutOptions{
		Branch: plumbing.NewBranchReferenceName(revision),
	})
}

func (r *PolicySourceReconciler) applyPolicyManifests(ctx context.Context, policyDir string) (int, error) {
	applied := 0
	err := filepath.Walk(policyDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() || !isYAML(path) {
			return nil
		}

		objects, err := decodePolicyFile(path)
		if err != nil {
			return err
		}
		for _, obj := range objects {
			if !isGatekeeperPolicy(obj) {
				continue
			}
			if err := r.Patch(ctx, obj, client.Apply, client.FieldOwner(fieldOwner), client.ForceOwnership); err != nil {
				return err
			}
			applied++
		}
		return nil
	})
	if err != nil {
		return applied, err
	}
	return applied, nil
}

func decodePolicyFile(path string) ([]*unstructured.Unstructured, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	decoder := yaml.NewYAMLOrJSONDecoder(bytes.NewReader(content), 4096)
	objects := []*unstructured.Unstructured{}
	for {
		raw := map[string]interface{}{}
		if err := decoder.Decode(&raw); err != nil {
			if err == io.EOF {
				break
			}
			return nil, err
		}
		if len(raw) == 0 {
			continue
		}
		obj := &unstructured.Unstructured{Object: raw}
		if obj.GetName() == "" || obj.GetKind() == "" {
			continue
		}
		objects = append(objects, obj)
	}
	return objects, nil
}

func isGatekeeperPolicy(obj *unstructured.Unstructured) bool {
	apiVersion := obj.GetAPIVersion()
	return obj.GetKind() == "ConstraintTemplate" ||
		strings.HasPrefix(apiVersion, "constraints.gatekeeper.sh/")
}

func isYAML(path string) bool {
	ext := filepath.Ext(path)
	return ext == ".yaml" || ext == ".yml"
}

func (r *PolicySourceReconciler) updateStatus(
	ctx context.Context,
	source *unstructured.Unstructured,
	revision string,
	conditionType string,
	status string,
	reason string,
	message string,
) error {
	statusMap := map[string]interface{}{
		"observedRevision": revision,
		"lastSyncTime":     time.Now().UTC().Format(time.RFC3339),
		"conditions": []interface{}{
			map[string]interface{}{
				"type":               conditionType,
				"status":             status,
				"reason":             reason,
				"message":            message,
				"lastTransitionTime": time.Now().UTC().Format(time.RFC3339),
			},
		},
	}
	source.Object["status"] = statusMap
	return r.Status().Update(ctx, source)
}

func firstError(primary error, secondary error) error {
	if primary != nil {
		return primary
	}
	return secondary
}

func AddToManager(mgr manager.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(policySourceObject()).
		Complete(&PolicySourceReconciler{
			Client: mgr.GetClient(),
			Scheme: mgr.GetScheme(),
		})
}

func policySourceObject() *unstructured.Unstructured {
	obj := &unstructured.Unstructured{}
	obj.SetGroupVersionKind(schema.GroupVersionKind{
		Group:   "policy.customer-cloud.io",
		Version: "v1alpha1",
		Kind:    "PolicySource",
	})
	return obj
}
