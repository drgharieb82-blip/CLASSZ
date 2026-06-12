from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.auth.router import router as auth_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=settings.api_version,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health", tags=["system"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok", "service": settings.project_name}

    app.include_router(auth_router, prefix=settings.api_prefix)

    return app


app = create_app()
