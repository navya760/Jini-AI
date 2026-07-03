from typing import Any, Dict, Optional, Literal

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., description="User-provided chat prompt")
    session_id: Optional[str] = Field(None, description="Optional session identifier")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    session_id: str
    message: str
    metadata: Optional[Dict[str, Any]] = None


class WSMessage(BaseModel):
    type: Literal["text", "voice"] = Field("text", description="Payload type for websocket message")
    payload: Dict[str, Any] = Field(default_factory=dict)
    session_id: Optional[str] = None
