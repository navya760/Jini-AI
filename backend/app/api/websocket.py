# import json

# from fastapi import APIRouter, WebSocket, WebSocketDisconnect

# from app.core.services import ai_service
# from app.services.tts_service import tts_service

# router = APIRouter()


# @router.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("Client connected")

#     try:
#         while True:
#             raw = await websocket.receive_text()
#             print("Received:", raw)

#             # Parse JSON from frontend
#             try:
#                 data = json.loads(raw)
#                 user_message = data.get("payload", {}).get("message", "")
#             except Exception:
#                 user_message = raw

#             # AI response
#             reply = await ai_service.generate_response(
#                 user_message=user_message,
#                 history=[]
#             )

#             # TTS disabled temporarily
#             audio_url = await tts_service.synthesize(
#     reply,
#     voice="af_heart"
# )

#             # Send response
#             # await websocket.send_json({
#             #     "type": "assistant.response",
#             #     "payload": {
#             #         "message": reply,
#             #         "audio_url": audio_url
#             #     }
#             # })

#             await websocket.send_json({
#     "type": "assistant.response",
#     "payload": {
#         "message": reply,
#         "audio_url": audio_url
#     }
# })

#     except WebSocketDisconnect:
#         print("Client disconnected")


# import json

# from fastapi import APIRouter, WebSocket, WebSocketDisconnect

# from app.core.services import ai_service

# router = APIRouter()


# @router.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("✅ Client connected")

#     try:
#         while True:
#             raw = await websocket.receive_text()
#             print("Received:", raw)

#             # Parse frontend JSON
#             try:
#                 data = json.loads(raw)

#                 if isinstance(data, dict):
#                     user_message = (
#                         data.get("payload", {}).get("message")
#                         or data.get("message")
#                         or raw
#                     )
#                 else:
#                     user_message = raw

#             except Exception:
#                 user_message = raw

#             # Generate AI reply
#             reply = await ai_service.generate_response(
#                 user_message=user_message,
#                 history=[]
#             )

#             # Send response (NO TTS)
#             await websocket.send_json({
#                 "type": "assistant.response",
#                 "payload": {
#                     "message": reply,
#                     "audio_url": None
#                 }
#             })

#     except WebSocketDisconnect:
#         print("❌ Client disconnected")

#     except Exception as e:
#         print("Backend Error:", e)

#         await websocket.send_json({
#             "type": "assistant.error",
#             "payload": {
#                 "message": str(e)
#             }
#         })



# import json

# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# from app.core.services import ai_service

# router = APIRouter()


# @router.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("✅ Client connected")

#     try:
#         while True:
#             raw = await websocket.receive_text()

#             print("Received:", raw)

#             try:
#                 data = json.loads(raw)

#                 if isinstance(data, dict):
#                     if "payload" in data and "message" in data["payload"]:
#                         user_message = data["payload"]["message"]
#                     elif "message" in data:
#                         user_message = data["message"]
#                     else:
#                         user_message = raw
#                 else:
#                     user_message = raw

#             except Exception:
#                 user_message = raw

#             print("User message:", user_message[:100])

#             reply = await ai_service.generate_response(
#                 user_message=user_message,
#                 history=[]
#             )

#             await websocket.send_json({
#                 "type": "assistant.response",
#                 "payload": {
#                     "message": reply,
#                     "audio_url": None
#                 }
#             })

#     except WebSocketDisconnect:
#         print("❌ Client disconnected")

#     except Exception as e:
#         print("Backend Error:", e)

#         await websocket.send_json({
#             "type": "assistant.error",
#             "payload": {
#                 "message": str(e)
#             }
#         })


import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.services import ai_service, voice_service

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected")

    try:
        while True:
            raw = await websocket.receive_text()
            print("Received:", raw)

            # Parse message safely
            try:
                
                data = json.loads(raw)

                if isinstance(data, dict):
                    # If this is a voice payload, transcribe the audio and use the
                    # transcription as the user message. Sending raw JSON that
                    # contains base64 audio was causing the Groq 413 "Request too large".
                    if data.get("type") == "voice":
                        audio_b64 = data.get("payload", {}).get("audio")
                        mime_type = data.get("payload", {}).get("mimeType")
                        if audio_b64 and voice_service:
                            # transcribe_audio is async; await it so we only send the
                            # resulting text to the AI model
                            user_message = await voice_service.transcribe_audio(
                                audio_base64=audio_b64,
                                mime_type=mime_type or "audio/wav",
                            )
                        else:
                            # Fallback to an empty message if transcription isn't available
                            user_message = ""
                    else:
                        if "payload" in data and "message" in data["payload"]:
                            user_message = data["payload"]["message"]
                        elif "message" in data:
                            user_message = data["message"]
                        else:
                            user_message = raw
                else:
                    user_message = raw

            except Exception:
                user_message = raw

            # ✅ DEBUG (FIXED POSITION)
            print("Message Length:", len(user_message))
            print("User message:", user_message[:300])

            # AI response
            reply = await ai_service.generate_response(
                user_message=user_message,
                history=[]
            )

            # Send response
            await websocket.send_json({
                "type": "assistant.response",
                "payload": {
                    "message": reply,
                    "audio_url": None
                }
            })

    except WebSocketDisconnect:
        print("❌ Client disconnected")

    except Exception as e:
        print("Backend Error:", e)

        await websocket.send_json({
            "type": "assistant.error",
            "payload": {
                "message": str(e)
            }
        })