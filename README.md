# AI-Powered Intelligent Learning Assistant

An AI-powered learning platform that helps learners understand course materials, receive programming assistance, and improve their learning experience through personalized recommendations and performance tracking.

## Features

### 1. AI Chatbot
- Answers questions using uploaded learning materials.
- Maintains conversational context and chat history.
- Uses Groq LLM integration.
- Provides source references for retrieved information.
- Refuses to guess when relevant information is unavailable.
- Maintains separate conversations for individual users.

### 2. Document Upload and Retrieval-Augmented Generation (RAG)
- Supports PDF, DOCX, and TXT documents.
- Extracts and cleans document text.
- Splits content into overlapping chunks.
- Generates embeddings using FastEmbed and the all-MiniLM-L6-v2 model.
- Stores and retrieves vectors using FAISS.
- Filters document retrieval by user ownership.
- Provides answers grounded in uploaded course materials.

### 3. Coding Assistant
- Supports Python, C, C++, Java, and SQL.
- Explains code and programming concepts.
- Identifies coding errors and suggests corrections.
- Generates code examples and practice questions.
- Does not execute or compile submitted code.

### 4. Personalized Learning
- Records quiz and exercise performance.
- Maintains user-specific performance history.
- Identifies topics that need improvement.
- Recommends relevant lessons.
- Determines beginner, intermediate, or advanced learning levels.
- Generates personalized practice questions with answers and explanations.
- Supports Python, C, C++, Java, and SQL practice.

### 5. Authentication and User Management
- Supports user registration and login.
- Uses password hashing with Argon2.
- Uses JWT-based authentication.
- Protects application endpoints.
- Isolates documents, conversations, and learning performance between users.

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
│   │   ├── sample_documents/
│   │   └── test_api.py
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
- Neon PostgreSQL database or another compatible PostgreSQL database
- Groq API key

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd Intelligent-Learning-Assistant
```

### 2. Set up the Python environment

Create a virtual environment in the project root:

```cmd
python -m venv venv
```

Activate it:

```cmd
venv\Scripts\activate
```

Install backend dependencies:

```cmd
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Configure the following variables:

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

For the frontend, configure `VITE_API_URL` in the appropriate frontend environment file.

For local development:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Never commit `.env` files or expose API keys, database credentials, or JWT secrets.

### 4. Start the backend

Open a terminal:

```cmd
cd backend
..\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health

### 5. Start the frontend

Open another terminal:

```cmd
cd frontend
npm install
npm run dev
```

Frontend:

http://localhost:5173

Login:

http://localhost:5173/login

Alternatively, run `start_project.bat` from the project root to start both local development servers.

## Testing

Run backend automated tests from the backend directory:

```cmd
..\venv\Scripts\python.exe -m pytest tests/test_api.py -v
```

The current test suite checks:

- Home endpoint availability.
- Backend health endpoint.
- API route registration.
- Rejection of unsupported coding languages.
- Rejection of unsupported document uploads.

The current automated test result is **5 passed**.

## RAG Workflow

1. A user uploads a supported learning document.
2. The backend extracts and cleans the document text.
3. The text is divided into overlapping chunks.
4. FastEmbed generates vector embeddings.
5. FAISS stores the document vectors.
6. The retrieval system searches for relevant chunks belonging to the authenticated user.
7. The Groq LLM generates an answer using the retrieved information.
8. Relevant source references are returned with the answer.

If the uploaded materials do not contain relevant information, the assistant responds:

`I couldn't find this information in the uploaded course materials.`

## Deployment

The application has deployment targets configured:

- **Frontend:** https://intelligent-learning-assistant-amber.vercel.app
- **Backend:** https://intelligent-learning-assistant-u0ad.onrender.com

Production environment variables and the latest application changes must be verified after deployment.

## Current Limitations

- Scanned PDFs requiring OCR are not supported.
- Coding assistance does not execute or compile submitted code.
- Answer quality depends on uploaded documents and retrieval relevance.
- The coding assistant provides AI-generated suggestions that should be reviewed before use.
- Production credentials must be securely configured and maintained.

## Project Goal

To provide an intelligent learning environment that combines document-based question answering, programming assistance, conversational learning, and performance-based personalized recommendations.