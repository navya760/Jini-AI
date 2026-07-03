from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.get("/")
def home():
    return {"status": "Jini AI backend operational"}

@app.post("/chat")
def chat(data: dict):
    message = data.get("message")
    return {"reply": f"Jini says: {message}"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    try:
        while True:
            data = await websocket.receive_text()
            print("Received:", data)

            reply = f"Jini says: {data}"
            await websocket.send_text(reply)

    except WebSocketDisconnect:
        print("Client disconnected")