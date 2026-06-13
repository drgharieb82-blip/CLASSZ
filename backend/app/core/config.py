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
    ai_provider: str = "mock"
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4.1-mini"
    ai_request_timeout_seconds: int = 30
    ai_max_retries: int = 1
    ai_cost_per_1k_input_tokens: float = 0.0
    ai_cost_per_1k_output_tokens: float = 0.0

    cors_origins_raw: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
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
