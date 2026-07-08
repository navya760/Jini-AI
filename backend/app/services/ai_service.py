# import asyncio
# from typing import Dict, List
# import requests
# from groq import Groq
# from app.core.config import settings


# class AIService:
#     def __init__(self):
#         self.client = Groq(api_key=settings.groq_api_key)
#         self.model = settings.groq_model

#         # Better chatbot personality
#         self.system_prompt = """
# You are Jini, a smart AI assistant like ChatGPT.

# Rules:
# - Reply naturally like a human chatbot
# - Keep answers short by default (1-4 lines)
# - Do NOT use markdown symbols like *, **, bullet points unless user asks
# - Do NOT give long essays unless user says: explain in detail / long answer
# - Be conversational, friendly, and clear
# - If user asks casual questions, answer casually
# """

#     async def generate_response(
#         self,
#         user_message: str,
#         history: List[Dict[str, str]]
#     ):
#         messages = [
#             {"role": "system", "content": self.system_prompt},
#             *history,
#             {"role": "user", "content": user_message}
#         ]

#         def sync_call():
#             return self.client.chat.completions.create(
#                 model=self.model,
#                 messages=messages,
#                 temperature=0.6,
#                 max_tokens=300,   # reduced from 1024
#             )

#         try:
#             response = await asyncio.to_thread(sync_call)
#             return response.choices[0].message.content

#         except Exception as e:
#             return f"Error generating response: {str(e)}"




# # import asyncio
# # from typing import Dict, List

# # import requests
# # from groq import Groq

# # from app.core.config import settings


# # class AIService:
# #     def __init__(self):
# #         self.client = Groq(api_key=settings.groq_api_key)
# #         self.model = settings.groq_model

# #         self.system_prompt = """
# # You are Jini, a smart AI assistant like ChatGPT.

# # Rules:
# # - Reply naturally like a human chatbot.
# # - If web search results are provided, use them to answer accurately.
# # - Keep answers short unless the user asks for details.
# # """

# #     def google_search(self, query: str) -> str:
# #         try:
# #             url = "https://google.serper.dev/search"

# #             headers = {
# #                 "X-API-KEY": settings.serper_api_key,
# #                 "Content-Type": "application/json",
# #             }

# #             payload = {
# #                 "q": query
# #             }

# #             response = requests.post(
# #                 url,
# #                 headers=headers,
# #                 json=payload,
# #                 timeout=10
# #             )

# #             data = response.json()

# #             context = ""

# #             if "answerBox" in data:
# #                 answer = data["answerBox"].get("answer") or data["answerBox"].get("snippet")
# #                 if answer:
# #                     context += f"Answer: {answer}\n\n"

# #             if "organic" in data:
# #                 for item in data["organic"][:5]:
# #                     context += f"""
# # Title: {item.get('title', '')}
# # Snippet: {item.get('snippet', '')}
# # Link: {item.get('link', '')}

# # """

# #             return context

# #         except Exception:
# #             return ""

# #     async def generate_response(
# #         self,
# #         user_message: str,
# #         history: List[Dict[str, str]]
# #     ):

# #         web_context = self.google_search(user_message)

# #         messages = [
# #             {
# #                 "role": "system",
# #                 "content": self.system_prompt,
# #             },
# #             *history,
# #             {
# #                 "role": "user",
# #                 "content": f"""
# # Web Search Results:

# # {web_context}

# # User Question:
# # {user_message}

# # If web search results are available, answer using them.
# # Otherwise answer using your own knowledge.
# # """,
# #             },
# #         ]

# #         def sync_call():
# #             return self.client.chat.completions.create(
# #                 model=self.model,
# #                 messages=messages,
# #                 temperature=0.6,
# #                 max_tokens=400,
# #             )

# #         try:
# #             response = await asyncio.to_thread(sync_call)
# #             return response.choices[0].message.content

# #         except Exception as e:
# #             return f"Error: {str(e)}"



import asyncio
from typing import Dict, List

import requests
from groq import Groq

from app.core.config import settings


class AIService:
    def __init__(self):
        
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

        self.system_prompt = """
You are Jini, a smart AI assistant.

Rules:
- Reply naturally.
- Keep answers short unless user asks for details.
- If web search results are available, always use them.
"""

    def google_search(self, query: str) -> str:
        try:
            response = requests.post(
                "https://google.serper.dev/search",
                headers={
                    "X-API-KEY": settings.serper_api_key,
                    "Content-Type": "application/json",
                },
                json={"q": query},
                timeout=10,
            )

            print("Serper Status:", response.status_code)

            if response.status_code != 200:
                print(response.text)
                return ""

            data = response.json()

            context = ""

            if "answerBox" in data:
                ans = (
                    data["answerBox"].get("answer")
                    or data["answerBox"].get("snippet")
                )

                if ans:
                    context += ans + "\n\n"

            if "organic" in data:
                for item in data["organic"][:3]:
                    context += (
                        f"{item.get('title','')}\n"
                        f"{item.get('snippet','')}\n\n"
                    )

            return context

        except Exception as e:
            print("Search Error:", e)
            return ""

    async def generate_response(
        self,
        user_message: str,
        history: List[Dict[str, str]],
    ):

        web_context = self.google_search(user_message)

        if web_context:
            prompt = f"""
Use the web search results below to answer.

Web Search:
{web_context}

Question:
{user_message}
"""
        else:
            prompt = user_message

        messages = [
            {
                "role": "system",
                "content": self.system_prompt,
            },
            *history[-4:],          # फक्त शेवच्या 4 messages
            {
                "role": "user",
                "content": prompt,
            },
        ]

        def sync_call():
            return self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.6,
                max_tokens=300,
            )

        try:
            response = await asyncio.to_thread(sync_call)
            return response.choices[0].message.content

        except Exception as e:
            return f"Error generating response: {e}"