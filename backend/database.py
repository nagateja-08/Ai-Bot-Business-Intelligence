import sys
from pathlib import Path

_current_dir = Path(__file__).resolve().parent
_root_dir = _current_dir.parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator, Dict, Any
import logging

try:
    from backend.config import settings
except ImportError:
    from config import settings

logger = logging.getLogger("salesiq.database")

# Ensure proper engine configuration
connect_args = {}
# If MySQL connection, configure SSL or timeout if needed
if "mysql" in settings.database_url:
    connect_args["connect_timeout"] = 10

try:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,      # Tests connection liveness before checkout
        pool_recycle=1800,       # Recycles connections every 30 mins to avoid MySQL idle disconnect
        pool_size=10,
        max_overflow=20,
        connect_args=connect_args
    )
except Exception as e:
    logger.error(f"Failed to create SQLAlchemy engine: {e}")
    # Fallback dummy engine if URL is invalid during initialization
    engine = None

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Any, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Yields None if the database engine is offline or unreachable.
    """
    if engine is None:
        yield None
        return

    try:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Could not connect to database session: {e}")
        yield None

def check_db_connection() -> Dict[str, Any]:
    """
    Actively verifies connectivity to the MySQL database.
    Returns status dict with connectivity flag, dialect, and latency or error details.
    """
    if engine is None:
        return {
            "status": "degraded",
            "connected": False,
            "database_type": "mysql",
            "message": "MySQL server offline. Falling back to verified dataset."
        }

    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            val = result.scalar()
            if val == 1:
                return {
                    "status": "healthy",
                    "connected": True,
                    "database_type": engine.dialect.name,
                    "message": "Successfully connected to MySQL database."
                }
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        return {
            "status": "degraded",
            "connected": False,
            "database_type": engine.dialect.name if engine else "mysql",
            "message": "MySQL server offline. Using verified dataset."
        }

    return {
        "status": "degraded",
        "connected": False,
        "database_type": "mysql",
        "message": "Using verified dataset."
    }
