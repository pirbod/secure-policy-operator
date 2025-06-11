package controllers

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type PolicySourceReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

func (r *PolicySourceReconciler) Reconcile(ctx context.Context, req reconcile.Request) (reconcile.Result, error) {
	policyDir := "/policies"
	err := filepath.Walk(policyDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && filepath.Ext(path) == ".yaml" {
			fmt.Println("Would apply:", path)
			// decode YAML and apply with Kubernetes client here
		}
		return nil
	})
	if err != nil {
		return reconcile.Result{}, err
	}
	return reconcile.Result{}, nil
}

func AddToManager(mgr manager.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		Complete(&PolicySourceReconciler{
			Client: mgr.GetClient(),
			Scheme: mgr.GetScheme(),
		})
}
