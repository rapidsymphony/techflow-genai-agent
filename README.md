## Techflow Support Agent(POC)

## Overview
The TechFlow Support Agent is designed to automate Level 1 customer support queries while providing advanced capabilities for Managers. Unlike standard chatbots, this agent uses a LangGraph orchestration layer to handle state, manage conversation history, and dynamically switch behaviors based on the user's role (e.g., Customer vs. Manager).

This project demonstrates a shift from rigid, pre-built platforms (like IBM watsonx) to a fully custom, scalable RAG (Retrieval-Augmented Generation) architecture.

## Features
- Intelligent Orchestration
- Swappable LLM Backend
- Role-Based Logic(eg: User, Manager)
- Modern Chat Interface
- Extensible API

## Tech Stack
- Frontend: React.js + Vite
- Styling: Tailwind CSS
- Backend API: FastAPI
- Orchestration: LangGraph
- LLM Integration: LangChain
- env: Python 3.13

## Project Structure
techflow-agent/
├── backend/                # The AI Brain (Python)
│   ├── app.py              # FastAPI server entry point
│   ├── graph.py            # LangGraph logic (The Agent definition)
│   ├── requirements.txt    # Python dependencies
│   └── .env                # API Keys (Gemini/OpenAI)
├── frontend/               # The User Interface (React) 
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── ChatInterface.jsx # Main chat logic
│   │   └── App.jsx         # App entry point
│   └── package.json        # Frontend dependencies
└── README.md               # Project Documentation

