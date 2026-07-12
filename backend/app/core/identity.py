"""
CLASSZ Global Identity & Public Code System.

Every entity in the platform has:
  - internalUUID: database-only, never exposed publicly
  - publicCode: human-readable, immutable after creation

Public codes follow the format: PREFIX-YY-SEQUENCE
where PREFIX identifies the entity type, YY is the creation year,
and SEQUENCE is a zero-padded sequential number.

This module defines the code formats and provides the CodeGeneratorService
that is the single source of truth for code generation.

Frontend must NEVER generate codes — only display them.
"""

from datetime import datetime
from enum import Enum
from typing import NamedTuple


class EntityType(str, Enum):
    # Users
    STUDENT = "student"
    TEACHER = "teacher"
    PARENT = "parent"
    ASSISTANT = "assistant"
    DEVELOPER = "developer"
    FINANCE = "finance"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

    # Academic / Content Studio
    SUBJECT = "subject"
    COURSE = "course"
    CHAPTER = "chapter"
    LESSON = "lesson"
    CONCEPT = "concept"
    ATOMIC_CONCEPT = "atomic_concept"
    SESSION = "session"
    MATERIAL = "material"
    VIDEO_SEGMENT = "video_segment"
    QUESTION = "question"
    QUIZ = "quiz"
    EXAM = "exam"
    HOMEWORK = "homework"
    ASSIGNMENT = "assignment"

    # Credentials & Records
    CERTIFICATE = "certificate"
    PAYMENT = "payment"
    WALLET_TRANSACTION = "wallet_transaction"
    NOTIFICATION = "notification"
    INVOICE = "invoice"
    COUPON = "coupon"
    PAYOUT = "payout"

    # Support & AI
    SUPPORT_TICKET = "support_ticket"
    AI_REQUEST = "ai_request"


class CodeFormat(NamedTuple):
    prefix: str
    sequence_digits: int


CODE_FORMATS: dict[EntityType, CodeFormat] = {
    # Users (6-digit sequence for students due to volume, 4 for others)
    EntityType.STUDENT: CodeFormat("CLS", 6),
    EntityType.TEACHER: CodeFormat("TCH", 4),
    EntityType.PARENT: CodeFormat("PRT", 4),
    EntityType.ASSISTANT: CodeFormat("AST", 4),
    EntityType.DEVELOPER: CodeFormat("DEV", 4),
    EntityType.FINANCE: CodeFormat("FIN", 4),
    EntityType.ADMIN: CodeFormat("ADM", 4),
    EntityType.SUPER_ADMIN: CodeFormat("SUP", 4),

    # Academic / Content Studio
    EntityType.SUBJECT: CodeFormat("SUB", 6),
    EntityType.COURSE: CodeFormat("CRS", 6),
    EntityType.CHAPTER: CodeFormat("CHP", 6),
    EntityType.LESSON: CodeFormat("LES", 6),
    EntityType.CONCEPT: CodeFormat("CON", 6),
    EntityType.ATOMIC_CONCEPT: CodeFormat("ATC", 6),
    EntityType.SESSION: CodeFormat("SES", 6),
    EntityType.MATERIAL: CodeFormat("MAT", 6),
    EntityType.VIDEO_SEGMENT: CodeFormat("SEG", 6),
    EntityType.QUESTION: CodeFormat("QST", 6),
    EntityType.QUIZ: CodeFormat("QZ", 6),
    EntityType.EXAM: CodeFormat("EXM", 6),
    EntityType.HOMEWORK: CodeFormat("HWK", 6),
    EntityType.ASSIGNMENT: CodeFormat("ASN", 6),

    # Credentials & Records (6-digit for high-volume)
    EntityType.CERTIFICATE: CodeFormat("CERT", 6),
    EntityType.PAYMENT: CodeFormat("PAY", 6),
    EntityType.WALLET_TRANSACTION: CodeFormat("WLT", 6),
    EntityType.NOTIFICATION: CodeFormat("NTF", 6),
    EntityType.INVOICE: CodeFormat("INV", 6),
    EntityType.COUPON: CodeFormat("CPN", 4),
    EntityType.PAYOUT: CodeFormat("PYT", 6),

    # Support & AI (6-digit for AI requests)
    EntityType.SUPPORT_TICKET: CodeFormat("TKT", 4),
    EntityType.AI_REQUEST: CodeFormat("AIR", 6),
}


def format_public_code(entity_type: EntityType, sequence: int, year: int | None = None) -> str:
    """
    Format a public code from entity type and sequence number.

    Args:
        entity_type: The type of entity
        sequence: Sequential number (from database sequence)
        year: Two-digit year (defaults to current year)

    Returns:
        Formatted code like "CLS-26-000145"
    """
    fmt = CODE_FORMATS[entity_type]
    yy = year if year is not None else datetime.now().year % 100
    seq_str = str(sequence).zfill(fmt.sequence_digits)
    return f"{fmt.prefix}-{yy:02d}-{seq_str}"


def parse_public_code(code: str) -> tuple[str, int, int] | None:
    """
    Parse a public code into (prefix, year, sequence).

    Returns None if the code is invalid.
    """
    parts = code.split("-")
    if len(parts) != 3:
        return None
    try:
        prefix = parts[0]
        year = int(parts[1])
        sequence = int(parts[2])
        return (prefix, year, sequence)
    except (ValueError, IndexError):
        return None


def validate_public_code(code: str, entity_type: EntityType | None = None) -> bool:
    """
    Validate a public code format.

    If entity_type is provided, also validates the prefix matches.
    """
    parsed = parse_public_code(code)
    if parsed is None:
        return False

    prefix, year, sequence = parsed

    if year < 24 or year > 99:
        return False

    if sequence < 1:
        return False

    if entity_type is not None:
        fmt = CODE_FORMATS[entity_type]
        if prefix != fmt.prefix:
            return False
        if len(str(sequence).zfill(fmt.sequence_digits)) != fmt.sequence_digits:
            return False

    return True


class CodeGeneratorService:
    """
    Service responsible for generating public codes.

    In production, this service reads the next sequence value from
    a PostgreSQL sequence (one per entity type per year) to guarantee
    uniqueness and ordering.

    This class is the SINGLE SOURCE OF TRUTH for code generation.
    Frontend must never generate codes.
    """

    def __init__(self) -> None:
        # In-memory counters for development/testing.
        # Production uses database sequences.
        self._counters: dict[str, int] = {}

    def _next_sequence(self, entity_type: EntityType, year: int) -> int:
        """Get the next sequence number for the given entity type and year."""
        key = f"{entity_type.value}:{year}"
        current = self._counters.get(key, 0)
        current += 1
        self._counters[key] = current
        return current

    def generate(self, entity_type: EntityType, year: int | None = None) -> str:
        """
        Generate the next public code for the given entity type.

        In production, this will:
        1. Acquire a database sequence value (atomic, no gaps under normal ops)
        2. Format the code
        3. Store the mapping (internalUUID -> publicCode)

        Returns:
            A new unique public code like "CLS-26-000145"
        """
        yy = year if year is not None else datetime.now().year % 100
        seq = self._next_sequence(entity_type, yy)
        return format_public_code(entity_type, seq, yy)

    def generate_student_code(self) -> str:
        return self.generate(EntityType.STUDENT)

    def generate_teacher_code(self) -> str:
        return self.generate(EntityType.TEACHER)

    def generate_parent_code(self) -> str:
        return self.generate(EntityType.PARENT)

    def generate_assistant_code(self) -> str:
        return self.generate(EntityType.ASSISTANT)

    def generate_developer_code(self) -> str:
        return self.generate(EntityType.DEVELOPER)

    def generate_finance_code(self) -> str:
        return self.generate(EntityType.FINANCE)

    def generate_admin_code(self) -> str:
        return self.generate(EntityType.ADMIN)

    def generate_super_admin_code(self) -> str:
        return self.generate(EntityType.SUPER_ADMIN)

    def generate_course_code(self) -> str:
        return self.generate(EntityType.COURSE)

    def generate_chapter_code(self) -> str:
        return self.generate(EntityType.CHAPTER)

    def generate_session_code(self) -> str:
        return self.generate(EntityType.SESSION)

    def generate_question_code(self) -> str:
        return self.generate(EntityType.QUESTION)

    def generate_quiz_code(self) -> str:
        return self.generate(EntityType.QUIZ)

    def generate_assignment_code(self) -> str:
        return self.generate(EntityType.ASSIGNMENT)

    def generate_certificate_code(self) -> str:
        return self.generate(EntityType.CERTIFICATE)

    def generate_payment_code(self) -> str:
        return self.generate(EntityType.PAYMENT)

    def generate_wallet_transaction_code(self) -> str:
        return self.generate(EntityType.WALLET_TRANSACTION)

    def generate_invoice_code(self) -> str:
        return self.generate(EntityType.INVOICE)

    def generate_coupon_code(self) -> str:
        return self.generate(EntityType.COUPON)

    def generate_payout_code(self) -> str:
        return self.generate(EntityType.PAYOUT)

    def generate_support_ticket_code(self) -> str:
        return self.generate(EntityType.SUPPORT_TICKET)

    def generate_ai_request_code(self) -> str:
        return self.generate(EntityType.AI_REQUEST)


# Singleton instance for application use
code_generator = CodeGeneratorService()
