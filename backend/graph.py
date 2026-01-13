# backend/graph.py
import os
from langchain_ollama import ChatOllama
from typing import Annotated, Literal, TypedDict
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END

# 1. Define the State (Memory)
class AgentState(TypedDict):
    messages: list
    user_role: str  # "L1_SUPPORT" or "MANAGER"

# 2. Configurable LLM Switcher (Satisfies Senthil's req)
def get_llm():
    # In the future, you can swap this based on .env config
    # e.g., if os.getenv("LLM_TYPE") == "IBM": return ChatWatsonx(...)
    return ChatOllama(model="llama3", temperature=0)

# 3. The Core Node (The Agent)
def chatbot_node(state: AgentState):
    llm = get_llm()
    user_role = state.get("user_role", "L1_SUPPORT")
    
    # Simple Role-Based Logic logic
    if user_role == "MANAGER":
        system_prompt = "You are a Senior Support Manager Assistant. You can approve refunds."
    else:
        system_prompt = "You are an L1 Support Agent. You can only answer policy questions."
    
    # Combine history with system prompt
    messages = [HumanMessage(content=system_prompt)] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}

# 4. Build the Graph
workflow = StateGraph(AgentState)
workflow.add_node("chatbot", chatbot_node)
workflow.set_entry_point("chatbot")
workflow.add_edge("chatbot", END)

# user --> chatbot --> End
# 5. Compile the App
app = workflow.compile()