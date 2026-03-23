import os
import socket
import datetime
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pymongo import MongoClient

# Load env variables
load_dotenv()

app = FastAPI(title="Smart Mirror AI Backend")

# Initialize CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
MODEL_NAME = os.getenv("MODEL_NAME", "llama3.1:8b")
MONGODB_URI = os.getenv("MONGODB_URI")
MIRROR_ID = os.getenv("MIRROR_ID", "rpi-vardhan-01")
PORT = int(os.getenv("PORT", 8000))

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

def get_local_ip():
    """Returns the machine's current local IP on the network."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80)) # Connect to an external IP to discover the local IP
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def register_ip():
    """Updates MongoDB with the current backend IP for discovery."""
    if not MONGODB_URI:
        print("MONGODB_URI not found in .env — skipping dynamic IP registration.")
        return
    
    local_ip = get_local_ip()
    backend_url = f"http://{local_ip}:{PORT}"
    
    try:
        client = MongoClient(MONGODB_URI)
        db = client["test"] # Database name depends on your MongoDB config
        mirrors = db["mirrors"]
        
        # Update (or upsert) the mirror document with the new backend IP
        mirrors.update_one(
            {"mirrorId": MIRROR_ID},
            {"$set": {
                "aiBackendUrl": backend_url, 
                "lastHeartbeat": datetime.datetime.now(datetime.timezone.utc)
            }},
            upsert=True
        )
        print(f"Registered Backend URL: {backend_url} for mirror {MIRROR_ID}")
        client.close()
    except Exception as e:
        print(f"Failed to register IP in MongoDB: {str(e)}")

@app.on_event("startup")
async def startup_event():
    register_ip()

@app.get("/")
def read_root():
    return {
        "message": "Smart Mirror API is running",
        "current_ip": get_local_ip(),
        "model": MODEL_NAME,
        "ollama_host": OLLAMA_URL
    }

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
        response = requests.post(OLLAMA_URL, json=payload, timeout=45)
        response.raise_for_status()
        data = response.json()
        return {"response": data.get("response", "No response generated.")}
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Ollama: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error connecting to Ollama: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
