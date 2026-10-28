from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator, Dict, Any
import logging
from backend.config import settings

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

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Ensures sessions are closed and connections returned to the pool after response.
    """
    if engine is None:
        raise RuntimeError("Database engine is not initialized. Please verify DATABASE_URL.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_connection() -> Dict[str, Any]:
    """
    Actively verifies connectivity to the MySQL database.
    Returns status dict with connectivity flag, dialect, and latency or error details.
    """
    if engine is None:
        return {
            "status": "error",
            "connected": False,
            "message": "Database engine could not be instantiated. Check DATABASE_URL configuration."
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
            "status": "unhealthy",
            "connected": False,
            "database_type": engine.dialect.name if engine else "unknown",
            "message": f"Cannot connect to database: {str(e)}"
        }

    return {
        "status": "unknown",
        "connected": False,
        "message": "Database query returned unexpected result."
    }
