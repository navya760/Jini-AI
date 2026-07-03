import asyncio
import base64
import io
import logging

from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

MIME_TYPE_TO_FILENAME = {
    "audio/wav": "input_audio.wav",
    "audio/x-wav": "input_audio.wav",
    "audio/webm": "input_audio.webm",
    "audio/ogg": "input_audio.ogg",
    "audio/mpeg": "input_audio.mp3",
}


class VoiceService:
    def __init__(self) -> None:
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_transcription_model

    async def transcribe_audio(
        self,
        audio_base64: str,
        mime_type: str = "audio/wav"
    ) -> str:
        audio_bytes = base64.b64decode(audio_base64)
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = MIME_TYPE_TO_FILENAME.get(mime_type, "input_audio.webm")
        audio_file.seek(0)

        return await self._transcribe(audio_file)

    async def _transcribe(self, file_obj: io.BytesIO) -> str:
        def sync_call():
            transcription = self.client.audio.transcriptions.create(
                model=self.model,
                file=file_obj,
            )
            return getattr(transcription, "text", None) or getattr(transcription, "transcript", "")

        try:
            text = await asyncio.to_thread(sync_call)
            return text.strip()
        except Exception as exc:  # noqa: BLE001
            logger.exception("Voice transcription failed")
            raise RuntimeError("Voice transcription failed. See backend logs for details.") from exc