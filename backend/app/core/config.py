from functools import cached_property

from pydantic import AnyHttpUrl, Field, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "CLASSZ"
    api_version: str = "0.1.0"
    api_prefix: str = "/api"
    environment: str = "local"

    postgres_server: str = "postgres"
    postgres_port: int = 5432
    postgres_user: str = "classz"
    postgres_password: str = "classz"
    postgres_db: str = "classz"

    jwt_secret_key: str = Field(
        default="change-me-in-production",
        min_length=16,
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    platform_fee_percent: float = 15.0
    tax_rate_percent: float = 15.0

    cors_origins_raw: str = Field(
        default="http://localhost:5180,http://127.0.0.1:5180",
        alias="CORS_ORIGINS",
    )

    @cached_property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_server,
                port=self.postgres_port,
                path=self.postgres_db,
            )
        )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url_sync(self) -> str:
        return str(
            PostgresDsn.build(
                scheme="postgresql+psycopg",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_server,
                port=self.postgres_port,
                path=self.postgres_db,
            )
        )


settings = Settings()

_DEFAULT_JWT_SECRET = "change-me-in-production"
_LOCAL_ENVIRONMENTS = {"local", "development", "test"}


def guard_against_insecure_defaults() -> None:
    """Refuses to boot with a placeholder JWT secret outside local/dev/test —
    that secret signs every access/refresh token, so leaving it at the
    checked-in default in a real deployment lets anyone forge sessions."""
    if settings.environment not in _LOCAL_ENVIRONMENTS and settings.jwt_secret_key == _DEFAULT_JWT_SECRET:
        raise RuntimeError(
            "Refusing to start: JWT_SECRET_KEY is still the default placeholder value "
            f"while ENVIRONMENT='{settings.environment}'. Set a strong, unique JWT_SECRET_KEY."
        )
