package main

deny contains msg if {
  not input.apiVersion
  msg := sprintf("%s is missing apiVersion", [input.metadata.name])
}

deny contains msg if {
  not input.kind
  msg := sprintf("%s is missing kind", [input.metadata.name])
}

deny contains msg if {
  input.kind == "ConstraintTemplate"
  not input.spec.crd.spec.names.kind
  msg := sprintf("ConstraintTemplate %s must define the generated constraint kind", [input.metadata.name])
}

deny contains msg if {
  input.kind == "CustomResourceDefinition"
  not input.spec.versions[_].schema.openAPIV3Schema
  msg := sprintf("CRD %s must include an OpenAPI schema", [input.metadata.name])
}

deny contains msg if {
  input.kind == "ClusterRole"
  count(input.rules) == 0
  msg := sprintf("ClusterRole %s must grant at least one rule", [input.metadata.name])
}
