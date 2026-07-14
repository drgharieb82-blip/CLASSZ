import asyncio
import unittest

from app.modules.ai_content.schemas import AIContentRequest
from app.modules.ai_content.service import generate_content


class AIContentTests(unittest.TestCase):
    def test_content_generator_returns_structured_items(self) -> None:
        async def run() -> None:
            response = await generate_content(
                AIContentRequest(
                    content_type="flashcards",
                    subject="Chemistry",
                    grade="Secondary 3",
                    topic="Oxidation Number",
                    count=3,
                )
            )

            self.assertEqual(response.content_type, "flashcards")
            self.assertGreaterEqual(len(response.items), 1)

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
