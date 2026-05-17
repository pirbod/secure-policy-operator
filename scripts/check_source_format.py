#!/usr/bin/env python3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_SUFFIXES = {".go", ".js", ".mjs", ".md", ".py", ".tf", ".ts", ".tsx", ".yaml", ".yml"}
SKIP_PARTS = {
    ".git",
    ".venv",
    "__pycache__",
    "dist",
    "node_modules",
}


def main() -> int:
    failures: list[str] = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix not in SOURCE_SUFFIXES:
            continue
        if any(part in SKIP_PARTS for part in path.relative_to(ROOT).parts):
            continue

        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()
        relative = path.relative_to(ROOT)
        if len(text) > 500 and len(lines) < 3:
            failures.append(f"{relative}: appears minified or missing line breaks")
        max_length = 400 if path.suffix == ".md" else 220
        for number, line in enumerate(lines, start=1):
            if len(line) > max_length:
                failures.append(f"{relative}:{number}: line exceeds {max_length} characters")

    if failures:
        print("Source format check failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("Source format check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
