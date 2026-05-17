PYTHON ?= python3
VENV := .venv
PY := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
NPM ?= npm

.PHONY: install dev api web test lint validate-demo generate-blueprint presales-pack

install:
	@$(PYTHON) -m venv $(VENV) && $(PIP) install --upgrade pip && $(PIP) install -r apps/api/requirements.txt || echo "Python virtualenv unavailable; API falls back to a local stdlib runner. Docker can run the FastAPI stack."
	$(NPM) --prefix apps/web install

api:
	@if [ -x "$(PY)" ] && $(PY) -c "import yaml" >/dev/null 2>&1; then PYTHONPATH=$(CURDIR) $(PY) scripts/run_api.py; else PYTHONPATH=$(CURDIR) $(PYTHON) scripts/run_api.py; fi

web:
	$(NPM) --prefix apps/web run dev -- --host 127.0.0.1 --port 5173

dev:
	bash -c 'trap "kill 0" EXIT; if [ -x "$(PY)" ] && $(PY) -c "import yaml" >/dev/null 2>&1; then PYBIN="$(PY)"; else PYBIN="$(PYTHON)"; fi; PYTHONPATH=$(CURDIR) $$PYBIN scripts/run_api.py & $(NPM) --prefix apps/web run dev -- --host 127.0.0.1 --port 5173 & wait'

test:
	PYTHONPATH=$(CURDIR) $(PYTHON) -m unittest discover apps/api/tests

lint:
	PYTHONPATH=$(CURDIR) $(PYTHON) -m compileall apps/api scripts
	$(NPM) --prefix apps/web run typecheck
	$(NPM) --prefix apps/web run build

validate-demo:
	PYTHONPATH=$(CURDIR) $(PYTHON) scripts/validate_environment.py --profile examples/customer-profile-regulated-bank.yaml
	PYTHONPATH=$(CURDIR) $(PYTHON) scripts/simulate_incident.py --issue azure-policy

generate-blueprint:
	PYTHONPATH=$(CURDIR) $(PYTHON) scripts/generate_blueprint.py --profile examples/customer-profile-regulated-bank.yaml --target "Azure AKS" --output examples/generated-azure-blueprint.yaml

presales-pack:
	PYTHONPATH=$(CURDIR) $(PYTHON) scripts/export_presales_pack.py --profile examples/customer-profile-regulated-bank.yaml --target "Azure AKS" --output docs/generated-presales-pack.md
