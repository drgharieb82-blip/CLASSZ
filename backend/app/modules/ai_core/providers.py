import asyncio
import json
import urllib.error
import urllib.request
from abc import ABC, abstractmethod

from app.core.config import settings
from app.modules.ai_core.schemas import AICompletionRequest, AICompletionResponse, AIUsage
from app.modules.ai_core.structured_output import parse_structured_json


class AIProvider(ABC):
    name: str
    model: str

    @abstractmethod
    async def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        raise NotImplementedError


def estimate_tokens(text: str) -> int:
    return max(1, len(text.split()))


def estimate_cost(prompt_tokens: int, completion_tokens: int) -> float:
    return (prompt_tokens / 1000 * settings.ai_cost_per_1k_input_tokens) + (
        completion_tokens / 1000 * settings.ai_cost_per_1k_output_tokens
    )


class MockAIProvider(AIProvider):
    name = "mock"
    model = "classz-mock-ai"

    async def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        prompt = "\n".join(message.content for message in request.messages)
        content = json.dumps(
            {
                "title": "Mock CLASSZ response",
                "answer": f"Structured mock response for {request.feature}.",
                "steps": ["Identify the concept.", "Explain it simply.", "Suggest one practice step."],
                "nextStep": "Review the related concept and solve one focused question.",
                "language": "ar" if "Arabic" in prompt or "ar" in prompt else "en",
            }
        )
        prompt_tokens = estimate_tokens(prompt)
        completion_tokens = estimate_tokens(content)

        return AICompletionResponse(
            provider=self.name,
            model=self.model,
            content=content,
            structured=parse_structured_json(content),
            usage=AIUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
                estimated_cost=0.0,
            ),
        )


class OpenAIProvider(AIProvider):
    name = "openai"

    def __init__(self, api_key: str, model: str | None = None) -> None:
        self.api_key = api_key
        self.model = model or settings.openai_model

    async def complete(self, request: AICompletionRequest) -> AICompletionResponse:
        return await asyncio.to_thread(self._complete_sync, request)

    def _complete_sync(self, request: AICompletionRequest) -> AICompletionResponse:
        payload = {
            "model": self.model,
            "messages": [message.model_dump() for message in request.messages],
            "temperature": request.temperature,
            "response_format": {"type": request.response_format},
        }
        http_request = urllib.request.Request(
            f"{settings.openai_base_url.rstrip('/')}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(http_request, timeout=settings.ai_request_timeout_seconds) as response:
                data = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError) as exc:
            raise RuntimeError("OpenAI provider request failed.") from exc

        content = data["choices"][0]["message"]["content"]
        usage_data = data.get("usage", {})
        prompt_tokens = int(usage_data.get("prompt_tokens", 0))
        completion_tokens = int(usage_data.get("completion_tokens", 0))
        total_tokens = int(usage_data.get("total_tokens", prompt_tokens + completion_tokens))

        return AICompletionResponse(
            provider=self.name,
            model=self.model,
            content=content,
            structured=parse_structured_json(content),
            usage=AIUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                estimated_cost=estimate_cost(prompt_tokens, completion_tokens),
            ),
        )


def get_ai_provider() -> AIProvider:
    if settings.ai_provider == "openai" and settings.openai_api_key:
        return OpenAIProvider(api_key=settings.openai_api_key)

    return MockAIProvider()
