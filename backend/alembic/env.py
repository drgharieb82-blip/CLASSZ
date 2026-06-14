from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.db.base import Base
from app.models import user  # noqa: F401
from app.modules.ai_core import models as ai_core_models  # noqa: F401
from app.modules.assistant import models as assistant_models  # noqa: F401
from app.modules.anti_cheating import models as anti_cheating_models  # noqa: F401
from app.modules.assignments import models as assignment_models  # noqa: F401
from app.modules.chapters import models as chapter_models  # noqa: F401
from app.modules.concepts import models as concept_models  # noqa: F401
from app.modules.courses import models as course_models  # noqa: F401
from app.modules.grading import models as grading_models  # noqa: F401
from app.modules.lesson_blocks import models as lesson_block_models  # noqa: F401
from app.modules.lessons import models as lesson_models  # noqa: F401
from app.modules.progress import models as progress_models  # noqa: F401
from app.modules.quiz_attempts import models as quiz_attempt_models  # noqa: F401
from app.modules.question_bank import models as question_bank_models  # noqa: F401
from app.modules.quizzes import models as quiz_models  # noqa: F401
from app.modules.results import models as result_models  # noqa: F401
from app.modules.revision_plans import models as revision_plan_models  # noqa: F401
from app.modules.students import models as student_models  # noqa: F401
from app.modules.student_memory import models as student_memory_models  # noqa: F401
from app.modules.teachers import models as teacher_models  # noqa: F401
from app.modules.videos import models as video_models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.database_url_sync)
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url_sync,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
