from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from ml.recommender import NLPRecommender
import os

recommender = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global recommender
    # Carrega a inteligencia artificial na memória do backend quando o servidor for iniciado
    recommender = NLPRecommender()
    yield
    # Limpeza se necessário ao desligar

app = FastAPI(title="IA Solutions SI-PI5", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/chat")
def chat(message: str):
    if not recommender:
        return {"error": "IA não carregada", "response": []}
    
    # Chama a funcao matematica
    result_data = recommender.recommend(message, top_n=3)
    
    # Retorna num formato que o JS do frontend consiga ler
    return result_data

# Servidor estatico para o Frontend de Página Unica (Se existir)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
    
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Executa o uvicorn local
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
