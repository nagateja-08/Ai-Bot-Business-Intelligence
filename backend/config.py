from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os
from pathlib import Path

# Locate root directory containing .env or backend/.env
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

class Settings(BaseSettings):
    # Database configuration
    database_url: str = Field(
        default="mysql+pymysql://root:password@127.0.0.1:3306/salesiq_db",
        validation_alias="DATABASE_URL",
        description="SQLAlchemy MySQL connection URL"
    )

    # Groq AI configuration
    groq_api_key: Optional[str] = Field(
        default=None,
        validation_alias="GROQ_API_KEY",
        description="Groq API key from console.groq.com"
    )
    groq_model: str = Field(
        default="llama-3.3-70b-versatile",
        validation_alias="GROQ_MODEL",
        description="Groq model ID (e.g. llama-3.3-70b-versatile, llama-3.1-8b-instant)"
    )

    # Server & Security
    frontend_origin: str = Field(
        default="http://localhost:5173",
        validation_alias="FRONTEND_ORIGIN",
        description="Allowed frontend origin for CORS"
    )
    port: int = Field(
        default=8000,
        validation_alias="PORT",
        description="Port to run backend service on"
    )

    # CSV File Location
    csv_path: str = Field(
        default=str(PROJECT_ROOT / "ai_bi_assistant_sales_data_cleaned.csv"),
        validation_alias="CSV_PATH",
        description="Path to cleaned sales data CSV"
    )

    model_config = SettingsConfigDict(
        env_file=[
            str(PROJECT_ROOT / ".env"),
            str(BASE_DIR / ".env")
        ],
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
