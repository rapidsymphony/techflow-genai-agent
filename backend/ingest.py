import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Define where to save the database
DB_PATH = "./chroma_db"

def ingest():
    print("🚀 Starting ingestion...")
    
    # 1. Load the file
    loader = TextLoader("./data/policy.txt")
    documents = loader.load()
    
    # 2. Split it into small chunks (so we find specific rules, not the whole book)
    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(documents)
    
    # 3. Create Embeddings (The "Math" representation of text)
    embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # 4. Save to ChromaDB
    db = Chroma.from_documents(
        documents=chunks, 
        embedding=embedding_function, 
        persist_directory=DB_PATH
    )
    
    print(f"✅ Saved {len(chunks)} chunks to {DB_PATH}.")

if __name__ == "__main__":
    ingest()