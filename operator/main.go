package main

import (
	"os"

	"github.com/pirbod/secure-policy-operator/operator/controllers"
	ctrl "sigs.k8s.io/controller-runtime"
)

func main() {
	mgr, err := ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{})
	if err != nil {
		os.Exit(1)
	}

	if err := controllers.AddToManager(mgr); err != nil {
		os.Exit(1)
	}

	if err := mgr.Start(ctrl.SetupSignalHandler()); err != nil {
		os.Exit(1)
	}
}
