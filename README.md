# IA Solutions - Sistema Inteligente de Suporte Tecnico e Diagnostico

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-Deep%20Learning-EE4C2C.svg)](https://pytorch.org/)
[![Hugging Face](https://img.shields.io/badge/Transformers-BERTimbau-yellow.svg)](https://huggingface.co/neuralmind/bert-base-portuguese-cased)
[![Status](https://img.shields.io/badge/Status-Projeto%20Academico%20(SI--PI5)-green.svg)]()

> Projeto Integrador V (SI-PI5) - 2026 / Turma 102 - Grupo 8  
> Solucao inteligente de triagem tecnica e diagnostico automatizado para sistemas de CFTV (Cameras, DVR, NVR, Switches PoE) e Controle de Acesso (Leitores Faciais).

---

## Sobre o Projeto

Em ambientes de seguranca eletronica e monitoramento patrimonial, incidentes tecnicos (como cameras fora do ar, falhas de gravacao em disco ou bloqueio de acesso) demandam diagnostico rapido. Na rotina operacional, atendentes de suporte nivel 1 frequentemente precisam consultar extensos manuais tecnicos ou acionar tecnicos de campo para problemas recorrentes.

O **IA Solutions** e uma plataforma que atua como **assistente inteligente de triagem tecnica**. Ele recebe o relato do cliente ou operador em linguagem natural e, utilizando uma **abordagem hibrida de Inteligencia Artificial**, diagnostica a causa-raiz mais provavel e apresenta um plano de acao imediato.

---

## Principais Funcionalidades

- **Compreensao em Linguagem Natural (NLP):** O usuario descreve a ocorrencia livremente (exemplo: "a luz piscou e as cameras apagaram todas").
- **Modelo de IA Hibrido (Semantica + Estatistica):**
  - **BERTimbau (Deep Learning):** Modelo pre-treinado em Portugues do Brasil para capturar contexto e sinonimos via Embeddings de 768 dimensoes.
  - **TF-IDF (Estatistico):** Vetorizacao esparsa para ponderar termos tecnicos e siglas essenciais (*DVR, PoE, HD, Switch*).
- **Similaridade de Cosseno:** Calculo de distancia vetorial ponderada (50% BERT + 50% TF-IDF) contra a base de conhecimento.
- **Calibracao de Probabilidades (Softmax com Temperatura T=8):** Transforma as metricas de distancia em percentuais de confianca assertivos.
- **Filtro de Seguranca e Modo Chatbot (Threshold 35%):** Evita respostas indevidas caso a entrada do usuario fuja do escopo de seguranca eletronica.
- **Respostas em Dois Niveis:**
  1. *O que voce deve tentar:* Acoes de primeiro nivel executaveis pelo proprio operador ou cliente.
  2. *Acao Tecnica Interna:* Diagnostico detalhado de hardware e infraestrutura para tecnicos de campo.
- **Interface Tematica:** Frontend responsivo e interativo com tema escuro inspirado no ambiente de desenvolvimento VS Code.

---

## Arquitetura do Sistema

```
                      +-----------------------------+
                      |       Frontend Web          |
                      |  (HTML5 / CSS3 / Vanilla JS)|
                      +--------------+--------------+
                                     |
                                     | HTTP GET /api/chat?message=...
                                     v
                      +-----------------------------+
                      |     Backend API (FastAPI)   |
                      |       Servidor Uvicorn      |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    Motor NLPRecommender     |
                      +--------------+--------------+
                             /               \
                            v                 v
            +--------------------+   +--------------------+
            |      BERTimbau     |   |       TF-IDF       |
            | (Embeddings 768-d) |   | (Palavras-Chave)   |
            +---------+----------+   +---------+----------+
                      \                       /
                       +----------+----------+
                                  |
                                  v
                   +------------------------------+
                   |    Similaridade de Cosseno   |
                   |   (50% BERT + 50% TF-IDF)    |
                   +--------------+---------------+
                                  |
                                  v
                   +------------------------------+
                   |  knowledge_base.json (Dados) |
                   +------------------------------+
```

---

## Estrutura de Arquivos

```text
SI-PI5-2026-T102-GRUPO8-IASolutions/
│
├── ml/
│   └── recommender.py          # Motor de IA: BERTimbau, TF-IDF, similaridade e Softmax
│
├── static/
│   ├── index.html              # Interface do chat web
│   ├── script.js               # Logica do frontend, animacoes de processamento e requisicoes
│   ├── style.css               # Estilizacao com design escuro (Dark Theme)
│   └── logo.png                # Identidade visual da aplicacao
│
├── knowledge_base.json         # Base de conhecimento tecnica com sintomas, classes e solucoes
├── main.py                     # Servidor FastAPI com rota /api/chat e montagem de arquivos estaticos
├── requirements.txt            # Dependencias do projeto (FastAPI, PyTorch, Transformers, etc.)
└── README.md                   # Documentacao do projeto
```

---

## Tecnologias e Bibliotecas Utilizadas

| Tecnologia / Pacote | Finalidade no Projeto |
| :--- | :--- |
| **Python 3.10+** | Linguagem principal do ecossistema de backend e IA |
| **FastAPI** | Framework assincrono para criacao da rota REST `/api/chat` |
| **Uvicorn** | Servidor ASGI para hospedar a API com recarregamento a quente |
| **PyTorch (`torch`)** | Motor de Deep Learning e execucao dos tensores da rede neural |
| **Transformers (Hugging Face)** | Download e execucao do modelo `neuralmind/bert-base-portuguese-cased` |
| **scikit-learn** | Extracao de features via `TfidfVectorizer` e calculo de `cosine_similarity` |
| **NumPy** | Operacoes matematicas de matrizes, ordenacao (`argsort`) e Softmax |
| **HTML5 / CSS3 / JavaScript** | Interface de usuario (SPA) interativa, leve e sem dependencias externas |

---

## Como Executar o Projeto Localmente

### 1. Pre-requisitos
- Python (versao 3.10 ou superior recomendada)
- Git instalado

### 2. Clonar o Repositorio
```bash
git clone https://github.com/Creolezi/SI-PI5-2026-T102-GRUPO8-IASolutions.git
cd SI-PI5-2026-T102-GRUPO8-IASolutions
```

### 3. Criar e Ativar o Ambiente Virtual

No Windows (CMD):
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

No Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

No Linux/macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Instalar as Dependencias
```bash
pip install -r requirements.txt
```

*Nota:* Na primeira execucao, o PyTorch e a Hugging Face farao o download automatico dos pesos do modelo BERTimbau (~430 MB).

### 5. Iniciar o Servidor
```bash
python main.py
```
Ou alternativamente via Uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### 6. Acessar a Aplicacao
Abra seu navegador e acesse:
`http://localhost:8080`

---

## Documentacao da API

### `GET /api/chat`
Recebe o relato do usuario como parametro de consulta (`query parameter`) e retorna a analise diagnostica.

#### Exemplo de Requisicao:
```http
GET /api/chat?message=minhas%20cameras%20apagaram%20depois%20da%20queda%20de%20energia
```

#### Exemplo de Resposta de Sucesso (`200 OK`):
```json
{
  "chatbot_mode": false,
  "diagnosticos": [
    {
      "probabilidade": 46.79,
      "classe": "CAMERAS NAO ESTAO GRAVANDO",
      "solucoes": "1. Reiniciar o DVR desligando da energia por 10 segundos. 2. Apos ligar, verificar se as gravacoes aparecem no sistema.",
      "tecnico": "HD corrompido, HD queimado, Falha no sistema de gravacao"
    },
    {
      "probabilidade": 38.61,
      "classe": "CAMERAS OFFLINE",
      "solucoes": "1. Reiniciar o DVR. 2. Verificar se as fontes das cameras estao ligadas. 3. Reiniciar o switch de rede.",
      "tecnico": "Switch queimado, Porta do switch danificada, Fonte de alimentacao queimada, Cabo de rede danificado"
    },
    {
      "probabilidade": 14.6,
      "classe": "CAMERA SEM IMAGEM",
      "solucoes": "1. Reiniciar o switch PoE. 2. Reiniciar o NVR/DVR.",
      "tecnico": "Porta PoE com defeito, Cabo de rede danificado, Camera IP com defeito"
    }
  ]
}
```

Caso a mensagem nao tenha relacao com os equipamentos suportados, o sistema aciona o modo de protecao:
```json
{
  "chatbot_mode": true,
  "reply": "Ola! Eu sou a Inteligencia Artificial de Suporte Tecnico do Grupo 8. Atualmente, fomos treinados para resolver problemas e diagnosticar falhas de Cameras, DVR, Rede e Controle de Acesso... Como posso lhe ajudar hoje?"
}
```

---

## Equipe e Creditos

Desenvolvido para a disciplina de **Projeto Integrador V (SI-PI5)** - 2026:
- **Turma:** 102
- **Grupo:** 8
- **Solucao:** IA Solutions
