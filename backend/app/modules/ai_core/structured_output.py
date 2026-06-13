import json
from typing import Any


class StructuredOutputError(ValueError):
    pass


def parse_structured_json(content: str) -> dict[str, Any]:
    try:
      parsed = json.loads(content)
    except json.JSONDecodeError as exc:
      raise StructuredOutputError("AI response was not valid JSON.") from exc

    if not isinstance(parsed, dict):
        raise StructuredOutputError("AI response must be a JSON object.")

    return parsed


def require_keys(payload: dict[str, Any], required_keys: set[str]) -> dict[str, Any]:
    missing = required_keys.difference(payload)
    if missing:
        raise StructuredOutputError(f"AI response missing required keys: {', '.join(sorted(missing))}")

    return payload
