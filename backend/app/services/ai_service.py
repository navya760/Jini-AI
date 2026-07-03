import asyncio
from typing import Dict, List

from groq import Groq
from app.core.config import settings


class AIService:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

        # Better chatbot personality
        self.system_prompt = """
You are Jini, a smart AI assistant like ChatGPT.

Rules:
- Reply naturally like a human chatbot
- Keep answers short by default (1-4 lines)
- Do NOT use markdown symbols like *, **, bullet points unless user asks
- Do NOT give long essays unless user says: explain in detail / long answer
- Be conversational, friendly, and clear
- If user asks casual questions, answer casually
"""

    async def generate_response(
        self,
        user_message: str,
        history: List[Dict[str, str]]
    ):
        messages = [
            {"role": "system", "content": self.system_prompt},
            *history,
            {"role": "user", "content": user_message}
        ]

        def sync_call():
            return self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.6,
                max_tokens=300,   # reduced from 1024
            )

        try:
            response = await asyncio.to_thread(sync_call)
            return response.choices[0].message.content

        except Exception as e:
            return f"Error generating response: {str(e)}"