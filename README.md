# Full Stack AI Studio (React + FastAPI + PostgreSQL + Ollama)

A containerized, 3-tier AI chat platform featuring real-time LLM token streaming, role-based access control (RBAC), per-user rate limiting, and persistent PostgreSQL chat history.

## System Architecture

```text
[ React + Markdown UI (Nginx:80) ] ---> (Port 5173)
               |
               | HTTP / ReadableStream (X-API-Key)
               v
[ FastAPI Backend (Uvicorn:8000) ] ---> [ Host Ollama Engine (:11434) ]
               |                        (via host.docker.internal)
               | psycopg2 (RealDictCursor)
               v
[ PostgreSQL 16 Database (:5432) ] ---> [ Docker Volume: postgres_data ]
```

## Key Features

- **Real-Time Token Streaming:** Streams generated tokens live from Ollama (`qwen2.5:1.5b` / `llama3`) to React using FastAPI `StreamingResponse` and browser `ReadableStream`.
- **Full PostgreSQL CRUD Lifecycle:** Automatically loads user-specific conversation history on startup (`GET /history/{username}`), logs streamed completions with token counts (`POST /chat_with_ai`), and supports one-click history deletion (`DELETE /chats/{username}`).
- **API Security & RBAC:** Protects routes via `X-API-Key` header validation (`401`), enforces sliding-window rate limiting (`429`), and restricts premium models to `pro` tier users (`403`).
- **Multi-Stage Production Frontend:** Compiles the React/Vite bundle in Node 20 Alpine and serves minified static assets via Nginx Alpine.
- **Environment Secret Isolation:** Externalizes database credentials and API keys into `.env` with a documented `.env.example` template.

## Tech Stack

- **Frontend:** React 18, Vite, `react-markdown`, Nginx (`nginx:alpine`)
- **Backend:** Python 3.11, FastAPI, Uvicorn, `psycopg2-binary`, `requests`
- **Database:** PostgreSQL 16 (`postgres:16-alpine`)
- **AI Engine:** Ollama (Local LLM inference)
- **DevOps:** Docker & Docker Compose

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose installed
- [Ollama](https://ollama.com/) running on the host machine (`ollama pull qwen2.5:1.5b`)

### 2. Configure Environment Variables
Clone the repository and create your `.env` file from the template:
```bash
git clone https://github.com/MohamedSuhail1024BGH/ai-studio-fullstack.git
cd learn-git
cp .env.example .env
```

### 3. Launch the 3-Tier Stack
Build and start the PostgreSQL, FastAPI, and Nginx containers in detached mode:
```bash
docker compose up -d --build
```
- **Frontend UI:** `http://localhost:5173`
- **FastAPI Swagger Docs:** `http://localhost:8000/docs`

## API Endpoints

| Method | Endpoint | Description | Auth Header |
| :--- | :--- | :--- | :--- |
| `POST` | `/chat_with_ai` | Stream AI response & save to PostgreSQL | `X-API-Key` |
| `GET` | `/history/{username}` | Fetch saved chat history for a user | `X-API-Key` |
| `DELETE` | `/chats/{username}` | Clear all saved chats for a user | `X-API-Key` |
| `GET` | `/analytics` | View joined user & token usage records | `X-API-Key` |