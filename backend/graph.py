# backend/graph.py
import os
from typing import TypedDict
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END

# RAG Imports
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Connect to the Knowledge Base (Read-Only)
# We use the same model as ingest.py so the math matches
embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)

class AgentState(TypedDict):
    messages: list
    user_role: str

def get_llm():
    # Ensure you have 'ollama serve' running!
    return ChatOllama(model="llama3", temperature=0)

def chatbot_node(state: AgentState):
    llm = get_llm()
    messages = state["messages"]
    user_role = state.get("user_role", "L1_SUPPORT")
    
    # 2. Get the user's last question
    last_user_msg = messages[-1].content
    print(f"🔎 Searching policy for: '{last_user_msg}'") # Debug print

    # 3. SEARCH ChromaDB for the 2 most relevant policy chunks
    results = vector_store.similarity_search(last_user_msg, k=2)
    
    context_text = ""
    if results:
        # Combine the found chunks into one block of text
        context_text = "\n\n".join([doc.page_content for doc in results])
    
    # 4. Create the Strict System Prompt
    if user_role == "MANAGER":
        system_prompt = (
            "You are a Senior Support Manager. "
            "Use the provided POLICY CONTEXT to answer. "
            "You have the authority to override rules if necessary for customer satisfaction. "
            "Be professional but flexible."
        )
    else:
        system_prompt = (
            "You are an L1 Support Agent. "
            "You must STRICTLY follow the POLICY CONTEXT below. "
            "If the policy says something is 'Manager Only' or 'Non-Refundable', you must enforce it. "
            "Do not make up rules."
        )

    # 5. Inject the Context into the prompt
    final_prompt = (
        f"{system_prompt}\n\n"
        f"=== OFFICIAL POLICY CONTEXT ===\n"
        f"{context_text}\n"
        f"==============================="
    )

    # Send everything to Llama 3
    # We replace the history's system message or prepend a new one
    conversation = [SystemMessage(content=final_prompt)] + messages
    response = llm.invoke(conversation)
    
    return {"messages": [response]}

# 6. Build the Graph
workflow = StateGraph(AgentState)
workflow.add_node("chatbot", chatbot_node)
workflow.set_entry_point("chatbot")
workflow.add_edge("chatbot", END)

app = workflow.compile()