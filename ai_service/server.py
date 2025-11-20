from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from gemini_ai import gemini_ai
from datetime import datetime

app = FastAPI(title="Vignan AI Assistant", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    role: str = "student"
    user_data: dict = None

class ChatResponse(BaseModel):
    success: bool
    response: str
    timestamp: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        print(f"🤖 Received query: {request.message} from {request.role}")
        response = gemini_ai.generate_response(request.message, request.role, request.user_data)
        print(f"🤖 AI Response generated successfully")
        return ChatResponse(success=True, response=response, timestamp=datetime.utcnow().isoformat())
    except Exception as e:
        print(f"❌ AI Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Vignan Gemini AI Assistant", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
async def root():
    return {"message": "Vignan AI Assistant Server is Running!"}

# Start server directly
print("🚀 Starting Vignan Gemini AI Server on http://localhost:8000")
print("✅ Gemini AI configured successfully!")
print("📡 Server starting...")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False, log_level="info")