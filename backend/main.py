import sys
from pathlib import Path

_current_dir = Path(__file__).resolve().parent
_root_dir = _current_dir.parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

try:
    from backend.config import settings
    from backend.database import check_db_connection
    from backend.routers import health, analytics, chat
except ImportError:
    from config import settings
    from database import check_db_connection
    from routers import health, analytics, chat

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("salesiq.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Checks database connectivity on startup without mutating existing data.
    """
    logger.info("Starting SalesIQ Business Intelligence Assistant API...")
    logger.info(f"Loaded Groq model: {settings.groq_model}")
    logger.info(f"Frontend origin allowed: {settings.frontend_origin}")

    # Check database status gracefully
    db_status = check_db_connection()
    if db_status.get("connected"):
        logger.info("[DB CONNECTED] Successfully established connection to MySQL.")
    else:
        logger.warning(f"[DB NOTICE] {db_status.get('message')}")
        logger.warning("To initialize local MySQL, run: python backend/init_db.py")

    yield

    logger.info("Shutting down SalesIQ API...")

app = FastAPI(
    title="SalesIQ — AI Business Intelligence API",
    description="FastAPI backend for SalesIQ AI-powered Business Intelligence Assistant with MySQL & Groq integration.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    settings.frontend_origin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# In production or if specified, allow any subdomain or render url
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if settings.frontend_origin != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(analytics.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {
        "service": "SalesIQ API",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check backend logs."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.port, reload=True)
