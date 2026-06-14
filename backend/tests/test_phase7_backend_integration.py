import asyncio
import unittest
from uuid import UUID, uuid4

from app.core.security import create_access_token, decode_access_token
from app.main import app
from app.models.user import Role
from app.modules.assistant.schemas import AssistantChatRequest
from app.modules.assistant.service import chat
from app.modules.student_memory.service import build_fallback_student_memory


class Phase7BackendIntegrationTests(unittest.TestCase):
    def test_phase7_routes_are_registered(self) -> None:
        routes = {(route.path, tuple(sorted(route.methods))) for route in app.routes}
        paths = {path for path, _methods in routes}

        self.assertIn("/api/auth/login", paths)
        self.assertIn("/api/auth/me", paths)
        self.assertIn("/api/students/{student_id}", paths)
        self.assertIn("/api/teachers/{teacher_id}", paths)
        self.assertIn("/api/concepts/{concept_id}", paths)
        self.assertIn("/api/student-memory/profile/{student_id}", paths)
        self.assertIn("/api/revision-plans/{student_id}", paths)
        self.assertIn("/api/assistant/chat", paths)

    def test_jwt_round_trip_includes_role(self) -> None:
        user_id = str(uuid4())
        token = create_access_token(user_id, {"role": Role.ASSISTANT_TEACHER.value})
        payload = decode_access_token(token)

        self.assertEqual(payload["sub"], user_id)
        self.assertEqual(payload["role"], "assistant_teacher")

    def test_roles_include_phase7_values(self) -> None:
        self.assertEqual(Role.ADMIN.value, "admin")
        self.assertEqual(Role.TEACHER.value, "teacher")
        self.assertEqual(Role.ASSISTANT_TEACHER.value, "assistant_teacher")
        self.assertEqual(Role.STUDENT.value, "student")
        self.assertEqual(Role.PARENT.value, "parent")

    def test_assistant_chat_matches_frontend_contract(self) -> None:
        async def run() -> None:
            response = await chat(AssistantChatRequest(message="Explain oxidation number"))
            payload = response.model_dump(by_alias=True)

            self.assertIn("userMessage", payload)
            self.assertIn("assistantMessage", payload)
            self.assertEqual(payload["assistantMessage"]["role"], "assistant")
            self.assertIn("Oxidation", payload["assistantMessage"]["content"])

        asyncio.run(run())

    def test_student_memory_fallback_includes_phase6_contracts(self) -> None:
        memory = build_fallback_student_memory(UUID("99999999-9999-9999-9999-999999999999"))
        payload = memory.model_dump(by_alias=True)

        self.assertIn("personalKnowledgeGraph", payload)
        self.assertIn("longTermMemory", payload)
        self.assertIn("studentPersona", payload)
        self.assertIn("personalTutorContext", payload)
        self.assertGreaterEqual(len(payload["personalKnowledgeGraph"]["nodes"]), 1)


if __name__ == "__main__":
    unittest.main()
