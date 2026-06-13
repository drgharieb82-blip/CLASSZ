import asyncio
import unittest

from app.modules.ai_core.prompting import PromptTemplateStore
from app.modules.ai_core.providers import MockAIProvider
from app.modules.ai_core.schemas import AICompletionRequest, AIMessage
from app.modules.ai_core.structured_output import StructuredOutputError, parse_structured_json, require_keys


class AICoreTests(unittest.TestCase):
    def test_prompt_template_renders_values(self) -> None:
        store = PromptTemplateStore()

        prompt = store.render("teacher.explain", concept="Oxidation", student_level="beginner", language="English", mode="revision", context="none")

        self.assertIn("Oxidation", prompt)
        self.assertIn("beginner", prompt)

    def test_structured_output_parser_requires_json_object(self) -> None:
        parsed = parse_structured_json('{"answer":"ok"}')

        self.assertEqual(parsed["answer"], "ok")
        with self.assertRaises(StructuredOutputError):
            parse_structured_json("[1, 2]")

    def test_required_keys_validation(self) -> None:
        payload = require_keys({"answer": "ok", "steps": []}, {"answer", "steps"})

        self.assertEqual(payload["answer"], "ok")
        with self.assertRaises(StructuredOutputError):
            require_keys({"answer": "ok"}, {"answer", "steps"})

    def test_mock_provider_returns_structured_response(self) -> None:
        async def run() -> None:
            provider = MockAIProvider()
            response = await provider.complete(
                AICompletionRequest(
                    feature="test",
                    messages=[AIMessage(role="user", content="Explain oxidation in English")],
                )
            )

            self.assertEqual(response.provider, "mock")
            self.assertIn("answer", response.structured)
            self.assertGreater(response.usage.total_tokens, 0)

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
