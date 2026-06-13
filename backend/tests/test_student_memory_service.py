import unittest

from app.modules.student_memory.service import DEFAULT_STUDENT_ID, build_seed_student_memory


class StudentMemoryServiceTests(unittest.TestCase):
    def test_seed_memory_contains_phase_6_sections(self) -> None:
        seed = build_seed_student_memory(DEFAULT_STUDENT_ID)

        self.assertEqual(seed["profile"]["student_id"], DEFAULT_STUDENT_ID)
        self.assertGreaterEqual(len(seed["strengths"]), 1)
        self.assertGreaterEqual(len(seed["weaknesses"]), 1)
        self.assertGreaterEqual(len(seed["timeline_events"]), 1)
        self.assertGreaterEqual(len(seed["forgetting_curve"]), 1)
        self.assertGreaterEqual(len(seed["recommendations"]), 1)
        self.assertGreaterEqual(len(seed["summaries"]), 1)
        self.assertGreaterEqual(len(seed["long_term_insights"]), 1)

    def test_seed_memory_keeps_frontend_event_shape(self) -> None:
        seed = build_seed_student_memory(DEFAULT_STUDENT_ID)
        event = seed["timeline_events"][0]

        self.assertEqual(event["event_type"].value, "LearningPathUpdated")
        self.assertEqual(event["importance"].value, "high")


if __name__ == "__main__":
    unittest.main()
