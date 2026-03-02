from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI(title="Smart Mirror AI Backend")

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.1:8b" # Update this to the exact model name pulled

class ChatRequest(BaseModel):
    prompt: str
    persona: str = "default"

PERSONA_PROMPTS = {
    "skincare_expert": "You are a professional skincare expert. Your advice should be practical, health-focused, and tailored for someone looking in a mirror. Keep it concise.",
    "gym_trainer": "You are an energetic and motivating gym personal trainer. Give workout tips, encourage fitness goals, and keep the user pumped up. Be brief.",
    "office_scheduler": "You are a highly organized executive assistant and office scheduler. Help the user prioritize their day, manage time, and stay focused. Be professional and concise.",
    "healthcare_guide": "You are a supportive and knowledgeable healthcare guide. Provide general wellness tips and health reminders. (Note: always include a disclaimer that you are not a real doctor if diagnosing). Keep it short.",
    "default": "You are the helpful AI assistant of this smart mirror. Be concise and polite."
}

@app.get("/")
def read_root():
    return {"message": "Smart Mirror API is running"}

@app.post("/chat")
def chat(request: ChatRequest):
    persona_system_prompt = PERSONA_PROMPTS.get(request.persona, PERSONA_PROMPTS["default"])
    
    full_prompt = f"{persona_system_prompt}\n\nUser: {request.prompt}\nAssistant:"

    payload = {
        "model": MODEL_NAME,
        "prompt": full_prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return {"response": data.get("response", "No response generated.")}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to Ollama: {str(e)}")
