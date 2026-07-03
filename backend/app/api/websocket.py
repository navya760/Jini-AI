import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.services import ai_service, memory_service, voice_service
from app.models.schemas import WSMessage

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_json(self, websocket: WebSocket, data: Dict[str, Any]) -> None:
        await websocket.send_text(json.dumps(data))


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    session_id: Optional[str] = None

    try:
        while True:
            try:
                raw_text = await websocket.receive_text()
            except WebSocketDisconnect:
                logger.info("WebSocket disconnected during receive")
                break

            logger.info("Received websocket message: %s", raw_text)
            session_id = "default"

            try:
                payload = WSMessage.model_validate_json(raw_text)
            except (ValidationError, json.JSONDecodeError) as exc:
                logger.exception("Invalid websocket payload")
                await manager.send_json(
                    websocket,
                    {
                        "type": "assistant.error",
                        "payload": {"message": f"Invalid websocket payload: {exc}"},
                    },
                )
                continue

            session_id = payload.session_id or "default"

            try:
                if payload.type == "text":
                    user_message = payload.payload.get("message", "") or ""
                    memory_service.add_message(session_id, "user", user_message)

                    assistant_reply = await ai_service.generate_response(
                        user_message=user_message,
                        history=memory_service.get_history(session_id),
                    )
                    memory_service.add_message(session_id, "assistant", assistant_reply)

                    await manager.send_json(
                        websocket,
                        {
                            "type": "assistant.response",
                            "session_id": session_id,
                            "payload": {"message": assistant_reply},
                        },
                    )

                elif payload.type == "voice":
                    if voice_service is None:
                        await manager.send_json(
                            websocket,
                            {
                                "type": "assistant.error",
                                "session_id": session_id,
                                "payload": {"message": "Voice transcription is temporarily unavailable."},
                            },
                        )
                        continue

                    audio_base64 = payload.payload.get("audio", "") or ""
                    mime_type = payload.payload.get("mimeType", "audio/webm") or "audio/webm"

                    if not audio_base64:
                        await manager.send_json(
                            websocket,
                            {
                                "type": "assistant.error",
                                "session_id": session_id,
                                "payload": {"message": "Audio payload is missing."},
                            },
                        )
                        continue

                    try:
                        transcript = await voice_service.transcribe_audio(audio_base64, mime_type)
                    except Exception as exc:  # noqa: BLE001
                        logger.exception("Voice transcription failed for session %s", session_id)
                        await manager.send_json(
                            websocket,
                            {
                                "type": "assistant.error",
                                "session_id": session_id,
                                "payload": {
                                    "message": "Voice transcription failed. Please try again.",
                                },
                            },
                        )
                        continue

                    memory_service.add_message(session_id, "user", transcript)

                    assistant_reply = await ai_service.generate_response(
                        user_message=transcript,
                        history=memory_service.get_history(session_id),
                    )
                    memory_service.add_message(session_id, "assistant", assistant_reply)

                    await manager.send_json(
                        websocket,
                        {
                            "type": "assistant.response",
                            "session_id": session_id,
                            "payload": {
                                "message": assistant_reply,
                                "transcript": transcript,
                            },
                        },
                    )
                else:
                    await manager.send_json(
                        websocket,
                        {
                            "type": "assistant.error",
                            "session_id": session_id,
                            "payload": {"message": "Unsupported websocket message type."},
                        },
                    )
            except Exception as exc:  # noqa: BLE001
                logger.exception("Error handling websocket message")
                await manager.send_json(
                    websocket,
                    {
                        "type": "assistant.error",
                        "session_id": session_id,
                        "payload": {"message": f"Backend error: {exc}"},
                    },
                )
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled websocket exception")
        await websocket.close(code=1011)
    finally:
        manager.disconnect(websocket)