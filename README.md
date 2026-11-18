# AI-Powered Intelligent Learning Assistant

An AI-powered learning platform that helps learners understand course materials, get programming assistance, and improve their learning through personalized recommendations.

## Features

### 1. AI Chatbot
- Answers questions using uploaded learning materials.
- Maintains conversation history.
- Uses Groq LLM integration.
- Provides source references for retrieved information.
- Falls back when the uploaded materials do not contain the answer.

### 2. Document Upload and RAG
- Supports PDF, DOCX, and TXT files.
- Extracts and cleans document text.
- Splits content into overlapping chunks.
- Generates embeddings using FastEmbed with the all-MiniLM-L6-v2 model.
- Stores and retrieves vectors using FAISS.

### 3. Coding Assistant
- Supports Python, C, C++, Java, and SQL.
- Explains code.
- Helps identify and correct coding errors.
- Generates examples and practice questions.

### 4. Personalized Learning
- Records quiz and exercise performance.
- Identifies topics that need improvement.
- Recommends relevant lessons.
- Suggests beginner, intermediate, or advanced learning levels.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI |
| LLM | Groq API |
| Embeddings | FastEmbed (ONNX Runtime) |
| Vector Database | FAISS |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Document Processing | PyMuPDF, python-docx |
| API Testing | Pytest, FastAPI TestClient |

## Project Structure

```text
Intelligent-Learning-Assistant/
├── backend/
│   ├── api/
│   ├── coding_assistant/
│   ├── document_processor/
│   ├── embeddings/
│   ├── personalization/
│   ├── rag/
│   ├── services/
│   ├── tests/
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   └── models.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── requirements.txt
├── .env
└── README.md
```

## Installation and Setup

### Prerequisites
- Python 3.13
- Node.js and npm
- PostgreSQL database
- Groq API key

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd Intelligent-Learning-Assistant
```

### 2. Set up the Python environment

```bash
python -m venv venv
```

Activate it on Windows:

```cmd
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the required values:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
```

Do not commit your `.env` file or expose API keys.

### 4. Start the backend

```cmd
cd backend
python -m uvicorn main:app --reload --port 8000
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 5. Start the frontend

Open another terminal:

```cmd
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Testing

Run backend tests from the backend directory:

```bash
pytest tests/test_api.py -v
```

The test suite checks:
- Home and health endpoints.
- API route registration.
- Invalid coding language handling.
- Rejection of unsupported document uploads.

## RAG Workflow

1. Upload a supported document.
2. Extract and clean its text.
3. Divide the content into chunks.
4. Generate vector embeddings.
5. Store vectors in FAISS.
6. Retrieve relevant chunks for a question.
7. Generate a grounded answer using the Groq LLM.

## Current Limitations

- Scanned PDFs requiring OCR are not supported.
- Coding assistance does not execute or compile submitted code.
- Answers depend on the available uploaded documents and retrieval quality.
- Production authentication, multi-user data isolation, and deployment require additional configuration and verification.

## Project Goal

To provide an intelligent learning environment that combines document-based question answering, programming support, and performance-based learning recommendations.