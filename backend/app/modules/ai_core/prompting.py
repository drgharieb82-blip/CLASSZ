from string import Template


class PromptTemplateStore:
    def __init__(self) -> None:
        self._templates: dict[str, str] = {
            "system.teacher": "You are CLASSZ AI Teacher. Respond with structured JSON, concise educational language, and no hidden reasoning.",
            "teacher.explain": "Explain $concept for a $student_level student in $language. Mode: $mode. Context: $context",
            "content.generate": "Create $content_type for $subject, grade $grade, topic $topic in $language. Return structured JSON.",
        }

    def render(self, name: str, **values: object) -> str:
        if name not in self._templates:
            raise KeyError(f"Prompt template not found: {name}")

        safe_values = {key: str(value) for key, value in values.items()}
        return Template(self._templates[name]).safe_substitute(safe_values)


prompt_templates = PromptTemplateStore()
