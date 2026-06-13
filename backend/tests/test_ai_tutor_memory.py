import unittest
from uuid import uuid4

from app.modules.ai_teacher.memory_context import build_memory_context
from app.modules.student_memory.schemas import StudentMemoryRead
from app.modules.student_memory.service import DEFAULT_STUDENT_ID, build_seed_student_memory
from app.modules.student_memory.repository import build_profile_with_children
from app.modules.student_memory.service import build_student_memory_response


class AITutorMemoryTests(unittest.TestCase):
    def build_memory(self, display_name: str, weakness: str) -> StudentMemoryRead:
        seed = build_seed_student_memory(DEFAULT_STUDENT_ID)
        seed["profile"]["display_name"] = display_name
        seed["weaknesses"][0]["concept_name"] = weakness
        profile = build_profile_with_children(seed)
        profile.id = uuid4()
        for collection in (
            profile.strengths,
            profile.weaknesses,
            profile.learning_preferences,
            profile.study_patterns,
            profile.attention_profiles,
            profile.timeline_events,
            profile.forgetting_curve,
            profile.recommendations,
            profile.summaries,
            profile.long_term_insights,
        ):
            for item in collection:
                item.id = uuid4()

        return build_student_memory_response(profile)

    def test_memory_context_changes_with_profile(self) -> None:
        first = build_memory_context(self.build_memory("Mariam", "Oxidation Number"))
        second = build_memory_context(self.build_memory("Omar", "Stoichiometry"))

        self.assertIn("Oxidation Number", first)
        self.assertIn("Stoichiometry", second)
        self.assertNotEqual(first, second)

    def test_memory_context_has_fallback(self) -> None:
        context = build_memory_context(None)

        self.assertIn("No persistent student memory", context)


if __name__ == "__main__":
    unittest.main()
