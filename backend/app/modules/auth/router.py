from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/jwt-config")
async def jwt_config() -> dict[str, str]:
    return {"token_type": "bearer"}
