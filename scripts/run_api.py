#!/usr/bin/env python3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def main() -> int:
    try:
        import uvicorn

        uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8000, reload=False)
    except ModuleNotFoundError:
        from apps.api.simple_server import run

        run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
