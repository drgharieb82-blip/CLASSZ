import asyncio
import unittest

from app.modules.ai_teacher.schemas import AITeacherRequest
from app.modules.ai_teacher.service import build_teacher_prompt, teach


class AITeacherTests(unittest.TestCase):
    def test_guided_hint_prompt_blocks_direct_answer(self) -> None:
        prompt = build_teacher_prompt(AITeacherRequest(concept="Oxidation", mode="guided_hint"))

        self.assertIn("Do not reveal the final answer directly", prompt)

    def test_teacher_returns_structured_response(self) -> None:
        async def run() -> None:
            response = await teach(AITeacherRequest(concept="Oxidation Number", language="en"))

            self.assertEqual(response.language, "en")
            self.assertGreaterEqual(len(response.steps), 1)

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
