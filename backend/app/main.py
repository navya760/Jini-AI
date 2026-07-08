# from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# from app.core.services import ai_service
# from app.services.tts_service import TTSService
# app = FastAPI()
# tts_service = TTSService()
 
# os.makedirs("backend/static/audio", exist_ok=True)
 
# app.mount(
#     "/audio",
#     StaticFiles(directory="backend/static/audio"),
#     name="audio",
# )
 
# from fastapi.staticfiles import StaticFiles 
# import os

# @app.get("/")
# def home():
#     return {"status": "Jini AI backend operational"}

# @app.post("/chat")
# def chat(data: dict):
#     message = data.get("message")
#     return {"reply": f"Jini says: {message}"}

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("Client connected")

#     try:
#         while True:
#             data = await websocket.receive_text()
#             print("Received:", data)

#             reply = f"Jini says: {data}"
#             await websocket.send_text(reply)

#     except WebSocketDisconnect:
#         print("Client disconnected")




from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
 
from app.api.websocket import router as websocket_router
import os
 
app = FastAPI()
 
# create audio folder
os.makedirs("backend/static/audio", exist_ok=True)
 
# mount static audio
app.mount(
    "/audio",
    StaticFiles(directory="backend/static/audio"),
    name="audio",
)
 
# include websocket router
app.include_router(websocket_router)
 
 
@app.get("/")
def home():
    return {"status": "Jini AI backend operational"}
 