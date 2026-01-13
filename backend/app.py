# backend/app.py
from dotenv import load_dotenv  
import os                       
import json

load_dotenv()  # <--- NEW LINE 3 (Actually loads the .env file)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from graph import app as agent_app  # Import the graph we just made

app = FastAPI()

# Allow React to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  #React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the Input Format
class ChatRequest(BaseModel):
    message: str
    user_role: str = "L1_SUPPORT"
    thread_id: str = "1"  # For conversation history

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
async def login(request: LoginRequest):
    # 1. Load users from JSON file
    try:
        with open("users.json", "r") as f:
            data = json.load(f)
            users = data["users"]
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="User database not found.")

    # 2. Find user
    user = next((u for u in users if u["username"] == request.username and u["password"] == request.password), None)

    if user:
        return {"success": True, "role": user["role"], "name": user["name"]}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Run the LangGraph Agent
        inputs = {
            "messages": [("user", request.message)],
            "user_role": request.user_role
        }
        config = {"configurable": {"thread_id": request.thread_id}}
        
        # Get the result
        result = agent_app.invoke(inputs, config=config)
        
        # Extract the bot's last message
        bot_response = result["messages"][-1].content
        return {"reply": bot_response}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)