
from groq import Groq

from config import GROQ_API_KEY, GROQ_MODEL


SUPPORTED_LANGUAGES = {
    "python",
    "c",
    "cpp",
    "java",
    "sql"
}


class CodingAssistant:

    def __init__(self):
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is missing.")

        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = GROQ_MODEL

    def process_code(
        self,
        language: str,
        code: str,
        task: str,
        question: str = ""
    ) -> dict:

        language = language.lower().strip()
        task = task.lower().strip()

        if language not in SUPPORTED_LANGUAGES:
            raise ValueError(
                "Supported languages: Python, C, C++, Java and SQL."
            )

        if task not in {
            "explain",
            "debug",
            "example",
            "practice"
        }:
            raise ValueError(
                "Task must be explain, debug, example or practice."
            )

        if not code.strip() and task not in {"example", "practice"}:
            raise ValueError("Please provide code for this task.")

        task_instructions = {
            "explain": (
                "Explain the supplied code line by line. "
                "Describe its purpose, syntax and execution flow."
            ),
            "debug": (
                "Identify errors in the supplied code. "
                "Explain why they occur and provide corrected code."
            ),
            "example": (
                "Provide a practical beginner-friendly example "
                "in the requested programming language."
            ),
            "practice": (
                "Generate five practice questions in the requested "
                "programming language, with answers and explanations."
            )
        }

        prompt = f"""
You are an expert programming tutor.

Programming language: {language}

Task: {task_instructions[task]}

Student question:
{question or "No additional question provided."}

Student code:
{code or "No code supplied. Create a suitable example."}

Instructions:
1. Explain concepts clearly.
2. Use correct syntax for the requested language.
3. For debugging, show corrected code and explain each fix.
4. For examples, provide runnable or valid code.
5. For practice, include five questions with answers.
6. Do not claim code was executed or tested unless it was.
7. Mention important assumptions when necessary.
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are ArchintX Coding Assistant, "
                        "a patient programming tutor."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_completion_tokens=2000
        )

        result = response.choices[0].message.content or ""

        return {
            "language": language,
            "task": task,
            "response": result.strip(),
            "status": "success"
        }
