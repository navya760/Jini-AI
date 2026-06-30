from fastapi import FastAPI, WebSocket, WebSocketDisconnect

import datetime

import json
 
app = FastAPI()
 
# ------------------------

# GET ENDPOINT

# ------------------------

@app.get("/")

def home():

    return {"status": "Jini AI running"}
 
 
# ------------------------

# AI RESPONSE FUNCTION

# ------------------------

def get_response(message: str):

    try:

        msg = message.lower()
 
        if "hello" in msg:

            return "Hi, I am Jini AI 🤖"
 
        elif "time" in msg:

            return str(datetime.datetime.now())
 
        else:

            return f"You said: {message}"
 
    except Exception as e:

        return f"Error: {str(e)}"
 
 
# ------------------------

# WEBSOCKET ENDPOINT

# ------------------------

@app.websocket("/ws")

async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
 
    try:

        while True:

            data = await websocket.receive_text()
 
            reply = get_response(data)
 
            response = {

                "reply": reply

            }
 
            await websocket.send_text(json.dumps(response))
 
    except WebSocketDisconnect:

        print("Client disconnected")
 
    except Exception as e:

        print("Error:", e)

        await websocket.close()
 