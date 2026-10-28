from fastapi import APIRouter, Response, status
from database import check_db_connection
from backend.services.groq_service import groq_service
from backend.config import settings
from backend.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health(response: Response):
    """
    Evaluates backend application readiness and dependency health (MySQL and Groq).
    Returns 200 if backend is operational, with detailed status flags.
    """
    db_health = check_db_connection()
    groq_ready = groq_service.is_configured()

    is_overall_healthy = db_health.get("connected", False)

    if not is_overall_healthy:
        # We still return the JSON payload describing the issue
        response.status_code = status.HTTP_200_OK  # keep 200 so UI can display friendly banner

    return HealthResponse(
        status="healthy" if is_overall_healthy else "degraded",
        database_connected=db_health.get("connected", False),
        database_message=db_health.get("message", "No database message"),
        groq_configured=groq_ready,
        groq_model=settings.groq_model,
        version="1.0.0"
    )
