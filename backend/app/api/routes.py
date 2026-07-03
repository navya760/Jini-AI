from fastapi import APIRouter, HTTPException

from app.core.services import ai_service, memory_service
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    session_id = request.session_id or "default"
    memory_service.add_message(session_id, "user", request.message)

    try:
        assistant_reply = await ai_service.generate_response(
            user_message=request.message,
            history=memory_service.get_history(session_id),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    memory_service.add_message(session_id, "assistant", assistant_reply)
    return ChatResponse(session_id=session_id, message=assistant_reply, metadata=request.metadata)
