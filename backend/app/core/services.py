import logging

from app.services.ai_service import AIService
from app.services.memory_service import MemoryService
from app.services.voice_service import VoiceService

logger = logging.getLogger(__name__)

ai_service = AIService()
memory_service = MemoryService()

try:
    voice_service = VoiceService()
except Exception as exc:  # noqa: BLE001
    logger.warning("Voice service disabled: %s", exc)
    voice_service = None