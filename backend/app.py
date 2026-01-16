# backend/app.py
from dotenv import load_dotenv  
import os                       
import json

load_dotenv()  # <--- NEW LINE 3 (Actually loads the .env file)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from graph import app as agent_app  # Import the graph we just made
from database import get_db_connection

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
    message: str          # The current user message
    messages: list = []   # <--- THIS WAS MISSING! (Stores the chat history)
    user_role: str = "L1_SUPPORT"
    thread_id: str = "default"

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
async def login(request: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # SQL Query: Secure parameter binding (?) prevents SQL Injection
    user = cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?", 
        (request.username, request.password)
    ).fetchone()
    
    conn.close()

    if user:
        return {
            "success": True, 
            "role": user["role"], 
            "name": user["name"],
            # We return username as the thread_id for now
            "thread_id": user["username"] 
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
# In backend/app.py

from langchain_core.messages import HumanMessage, AIMessage # <--- Add this import!

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"🧠 Receiving Message: {request.message}")
    print(f"📜 Full History Length: {len(request.messages)}")
    # 1. Convert React messages (dicts) to LangChain messages (Objects)
    # This ensures the LLM understands the history perfectly.
    converted_messages = []
    for m in request.messages:
        if m['role'] == 'user':
            converted_messages.append(HumanMessage(content=m['content']))
        elif m['role'] == 'ai':
            converted_messages.append(AIMessage(content=m['content']))

    # 2. Run the graph with the converted history
    # We pass 'messages' and 'user_role' into the state
    inputs = {
        "messages": converted_messages,
        "user_role": request.user_role
    }
    
    result = agent_app.invoke(inputs)

    # 3. Extract ONLY the string content from the last message
    last_message = result["messages"][-1]
    response_text = last_message.content  # <--- THIS IS THE FIX (Extracting text)

    return {"response": response_text}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Manager end to end use case
# L2 end to end use case