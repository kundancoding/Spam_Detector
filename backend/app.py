from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from phishing_model import classify_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class Message(BaseModel):
    message: str

@app.post("/detect")
def detect(data: Message):
    label, confidence, explanation, spam_emails = classify_message(data.message)
    return {
        "label": label,
        "confidence": confidence,
        "explanation": explanation,
        "spam_emails": spam_emails
    }