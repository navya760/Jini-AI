# import os
# import uuid
# import requests


# class TTSService:
#     def __init__(self):
#         self.base_url = "http://localhost:8880"

#     async def synthesize(self, text: str, voice: str = "af_heart") -> str:
#         os.makedirs("backend/static/audio", exist_ok=True)

#         file_id = str(uuid.uuid4())
#         file_path = f"backend/static/audio/{file_id}.mp3"

#         payload = {
#             "model": "kokoro",
#             "input": text,
#             "voice": voice,
#             "response_format": "mp3",
#             "download_format": "mp3",
#             "speed": 1,
#             "stream": False,
#             "return_download_link": False
#         }

#         response = requests.post(
#             f"{self.base_url}/v1/audio/speech",
#             json=payload,
#             timeout=60,
#         )

#         response.raise_for_status()

#         with open(file_path, "wb") as f:
#             f.write(response.content)

#         return f"/audio/{file_id}.mp3"


# tts_service = TTSService()




import os
import uuid
import requests


class TTSService:
    def __init__(self):
        self.base_url = "http://localhost:8880"

    async def synthesize(self, text: str, voice: str = "af_heart") -> str:
        os.makedirs("backend/static/audio", exist_ok=True)

        file_id = str(uuid.uuid4())
        file_path = f"backend/static/audio/{file_id}.mp3"

        payload = {
            "model": "kokoro",
            "input": text,
            "voice": voice,
            "response_format": "mp3",
            "download_format": "mp3",
            "speed": 1,
            "stream": False,
            "return_download_link": False
        }

        response = requests.post(
            f"{self.base_url}/v1/audio/speech",
            json=payload,
            timeout=60,
        )

        response.raise_for_status()

        with open(file_path, "wb") as f:
            f.write(response.content)

        return f"http://127.0.0.1:8000/audio/{file_id}.mp3"


tts_service = TTSService()