from datetime import UTC, datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from typing import Any
from urllib.parse import urlparse

from .services.assessment_engine import assess_customer_profile, executive_summary
from .services.blueprint_engine import generate_blueprint
from .services.data_store import (
    blueprints,
    customer_by_id,
    customers,
    environment_health,
    policy_controls,
    runbooks,
    support_cases,
)
from .services.policy_engine import evaluate_environment
from .services.runbook_engine import recommend_runbook
from .services.support_engine import triage_support_case


class ApiHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        self._send_json({})

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/health":
            self._send_json({"status": "ok", "version": "1.0.0", "timestamp": datetime.now(UTC).isoformat()})
        elif path == "/api/executive-summary":
            self._send_json(executive_summary(customers(), environment_health(), support_cases()))
        elif path == "/api/customers":
            self._send_json(customers())
        elif path.startswith("/api/customers/"):
            customer = customer_by_id(path.rsplit("/", 1)[-1])
            self._send_json(customer or {"detail": "Customer environment not found"}, 200 if customer else 404)
        elif path == "/api/blueprints":
            self._send_json(blueprints())
        elif path == "/api/policies":
            self._send_json(policy_controls())
        elif path == "/api/operations/health":
            self._send_json(environment_health())
        elif path == "/api/support/cases":
            self._send_json(support_cases())
        elif path == "/api/runbooks":
            self._send_json(runbooks())
        else:
            self._send_json({"detail": "Not found"}, 404)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        body = self._read_body()
        if path == "/api/assess":
            profile = body.get("customer_profile") or body.get("profile") or body.get("customer")
            self._send_json(assess_customer_profile(profile))
        elif path == "/api/blueprints/generate":
            self._send_json(generate_blueprint(
                body["customer_profile"],
                body["target_cloud"],
                body["compliance_level"],
                body.get("required_services", []),
                body.get("data_heavy_dependencies", []),
            ))
        elif path == "/api/policies/evaluate":
            self._send_json(evaluate_environment(body["environment_profile"], policy_controls()))
        elif path == "/api/support/triage":
            self._send_json(triage_support_case(body["description"], support_cases(), runbooks()))
        elif path == "/api/runbooks/recommend":
            self._send_json(recommend_runbook(body["issue_category"], body["platform"], runbooks()))
        else:
            self._send_json({"detail": "Not found"}, 404)

    def log_message(self, format: str, *args: Any) -> None:
        return

    def _read_body(self) -> dict[str, Any]:
        length = int(self.headers.get("content-length", "0"))
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def _send_json(self, payload: Any, status: int = 200) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(encoded)


def run(host: str = "0.0.0.0", port: int = 8000) -> None:
    server = ThreadingHTTPServer((host, port), ApiHandler)
    print(f"API server running on http://{host}:{port}")
    server.serve_forever()
