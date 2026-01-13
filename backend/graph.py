# backend/graph.py
import os
from typing import TypedDict
from langchain_ollama import ChatOllama
# 1. Import SystemMessage here 👇
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage 
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    messages: list
    user_role: str

def get_llm():
    return ChatOllama(model="llama3", temperature=0)

def chatbot_node(state: AgentState):
    llm = get_llm()
    user_role = state.get("user_role", "L1_SUPPORT")
    
    # 2. Stronger, simpler prompts to stop the "yapping"
    if user_role == "MANAGER":
        prompt_text = (
            "You are a Senior Support Manager. "
            "You have authority to approve refunds and override policies. "
            "Answer the user's question directly and concisely. Do not introduce yourself."
        )
    else:
        prompt_text = (
            "You are an L1 Support Agent. "
            "You can answer policy questions but CANNOT approve refunds. "
            "Answer the question directly. Do not start every message with 'I am an L1 agent'."
        )
    
    # 3. Use SystemMessage for the instruction 👇
    # This tells Llama: "This is a rule, not a chat message."
    messages = [SystemMessage(content=prompt_text)] + state["messages"]
    
    response = llm.invoke(messages)
    return {"messages": [response]}

workflow = StateGraph(AgentState)
workflow.add_node("chatbot", chatbot_node)
workflow.set_entry_point("chatbot")
workflow.add_edge("chatbot", END)

app = workflow.compile()