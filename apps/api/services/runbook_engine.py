from typing import Any


def flatten_runbooks(runbooks: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for category, entries in runbooks.items():
        for runbook in entries:
            items.append({**runbook, "category": category})
    return items


def recommend_runbook(issue_category: str, platform: str, runbooks: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    issue = issue_category.lower()
    target = platform.lower()
    issue_words = [word.strip(".,:/()").lower() for word in issue.split() if len(word.strip(".,:/()")) > 3]
    candidates = flatten_runbooks(runbooks)

    scored = []
    for runbook in candidates:
        text = " ".join([
            runbook.get("id", ""),
            runbook.get("title", ""),
            runbook.get("category", ""),
            " ".join(runbook.get("platforms", [])),
            " ".join(runbook.get("triggers", [])),
        ]).lower()
        score = 0
        if issue in text:
            score += 5
        if target in text or "all" in runbook.get("platforms", []):
            score += 3
        score += sum(1 for word in issue_words if word in text)
        if runbook.get("id", "").replace("-", " ") in issue:
            score += 4
        scored.append((score, runbook))

    scored.sort(key=lambda item: item[0], reverse=True)
    selected = scored[0][1] if scored and scored[0][0] > 0 else candidates[0]
    return {
        "runbook": selected,
        "match_confidence": min(96, 72 + scored[0][0] * 3 if scored else 72),
        "reason": f"Matched {issue_category} on {platform} to the closest known operational pattern.",
    }
