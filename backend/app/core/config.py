from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base path
BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

# Load .env
load_dotenv(dotenv_path=ENV_FILE)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ===== GROQ =====
    groq_api_key: Optional[str] = None
    groq_model: str = "llama-3.1-8b-instant"
    groq_transcription_model: str = "whisper-large-v3"

    # ===== OPENAI (for voice service compatibility) =====
    openai_api_key: Optional[str] = None
    openai_transcription_model: Optional[str] = "whisper-1"

    # ===== CORS =====
    cors_origins: List[str] = ["*"]

    @property
    def groq_api_key_warning(self) -> Optional[str]:
        if not self.groq_api_key:
            return "GROQ_API_KEY is missing. Please add it to backend/.env"
        return None


settings = Settings()