# AI-Powered Intelligent Learning Assistant

An AI-powered learning platform developed for ArchintX that helps learners understand course materials, receive programming assistance, and improve their learning experience through personalized recommendations and performance tracking.

## Features

### 1. AI Learning Chatbot
- Answers questions using uploaded learning materials.
- Maintains conversational context and chat history.
- Supports conversational follow-up questions.
- Uses Groq LLM integration.
- Provides source references for retrieved information.
- Avoids guessing when relevant information is unavailable.
- Maintains separate conversations for individual users.
- Supports selection-based deletion of conversations and individual messages.

### 2. Document Management and RAG
- Supports PDF, DOCX, and TXT uploads.
- Extracts and processes document text.
- Splits content into overlapping chunks.
- Generates embeddings using FastEmbed and all-MiniLM-L6-v2.
- Stores and retrieves vectors using FAISS.
- Filters document retrieval by authenticated user ownership.
- Provides answers grounded in uploaded course materials.
- Supports document preview, download, and deletion.

### 3. AI Coding Assistant
- Supports Python, C, C++, Java, and SQL.
- Explains programming concepts and code.
- Identifies coding errors and suggests corrections.
- Generates code examples and practice questions.
- Does not execute or compile submitted code.

### 4. Personalized Learning
- Records quiz and exercise performance.
- Maintains user-specific performance history.
- Identifies weak topics.
- Recommends relevant lessons.
- Determines beginner, intermediate, and advanced learning levels.
- Generates personalized practice questions with answers and explanations.

### 5. Authentication and User Management
- User registration and login.
- Password hashing using Argon2.
- JWT-based authentication.
- Protected application endpoints.
- User-specific document, conversation, and learning-performance data.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI |
| LLM | Groq API |
| Embeddings | FastEmbed, ONNX Runtime |
| Vector Database | FAISS |
| Database | Neon PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT, Argon2 |
| Document Processing | PyMuPDF, python-docx |
| API Testing | Pytest, FastAPI TestClient |

## Project Structure

```text
Intelligent-Learning-Assistant/
├── backend/
│   ├── api/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── coding.py
│   │   ├── documents.py
│   │   └── personalization.py
│   ├── coding_assistant/
│   ├── document_processor/
│   ├── embeddings/
│   ├── personalization/
│   ├── rag/
│   ├── tests/
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── main.py
│   ├── models.py
│   └── security.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── requirements.txt
├── .gitignore
├── start_project.bat
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3.13
- Node.js and npm
- PostgreSQL database (Neon PostgreSQL recommended)
- Groq API key

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Intelligent-Learning-Assistant
```

### 2. Set Up Python Environment

```cmd
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET_KEY=your_secure_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

APP_NAME=ArchintX Intelligent Learning Assistant
APP_ENV=development
DEBUG=True

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_DB_PATH=vector_store
```

For local frontend development, configure `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Never commit `.env` files, API keys, database credentials, or JWT secrets.

### 4. Start the Backend

From the project root:

```cmd
cd backend
..\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Backend URL: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

Health check: http://127.0.0.1:8000/health

### 5. Start the Frontend

Open another terminal:

```cmd
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

Alternatively, use `start_project.bat` from the project root if configured for your local environment.

## Testing

Run backend tests from the project root:

```cmd
venv\Scripts\python.exe -m pytest
```

Compile backend Python files:

```cmd
venv\Scripts\python.exe -m compileall backend
```

Build the frontend for production:

```cmd
cd frontend
npm run build
```

## RAG Workflow

1. User uploads a supported learning document.
2. Backend extracts and cleans document text.
3. Text is divided into overlapping chunks.
4. FastEmbed generates vector embeddings.
5. FAISS stores the document vectors.
6. Retrieval searches for relevant chunks belonging to the authenticated user.
7. Groq generates an answer using retrieved information.
8. Relevant source references are returned with the answer.

When relevant information is unavailable in uploaded materials, the assistant avoids inventing an answer.

## Deployment

**Frontend:** https://intelligent-learning-assistant-amber.vercel.app

**Backend:** https://intelligent-learning-assistant-u0ad.onrender.com

The frontend connects to the deployed backend through the `VITE_API_URL` environment variable. Production credentials and environment variables must be configured securely.

## Current Limitations

- Scanned PDFs requiring OCR are not supported.
- Coding assistance does not execute or compile submitted code.
- Answer quality depends on uploaded documents and retrieval relevance.
- AI-generated programming suggestions should be reviewed before use.
- Production credentials must be securely configured and maintained.

## Project Goal

To provide an intelligent learning environment combining document-based question answering, programming assistance, conversational learning, and performance-based personalized recommendations.