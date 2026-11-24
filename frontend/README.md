# Intelligent Learning Assistant - Frontend

React-based frontend for the ArchintX AI-Powered Intelligent Learning Assistant.

## Features

### Authentication
- User registration and login.
- JWT-based authenticated API communication.
- Logout functionality.

### AI Chatbot
- Conversational AI chatbot.
- Follow-up questions with conversation context.
- Chat history.
- Selection-based deletion of conversations and individual messages.

### Document Management
- Upload PDF, DOCX, and TXT learning materials.
- View uploaded document information.
- Preview uploaded documents.
- Download uploaded documents.
- Delete uploaded documents.
- Course-material question answering.

### AI Coding Assistant
- Programming assistance for Python, C, C++, Java, and SQL.
- Code explanations and debugging suggestions.
- Code examples and practice questions.

### Personalized Learning
- Personalized learning dashboard.
- Performance tracking.
- Weak-topic identification.
- Adaptive learning recommendations.
- Personalized practice questions with answers and explanations.

## Technology Stack

- React
- Vite
- JavaScript
- React Router
- React Markdown
- Recharts
- Axios

## Project Structure

```text
frontend/
├── src/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── App.css
├── public/
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js
- npm
- Running FastAPI backend

### 1. Install Dependencies

From the frontend directory:

```cmd
npm install
```

### 2. Configure Backend URL

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

For production, configure `VITE_API_URL` with the deployed backend URL in the Vercel project environment variables.

### 3. Start Development Server

```cmd
npm run dev
```

Open:

http://localhost:5173

## Production Build

Run:

```cmd
npm run build
```

The production-ready files are generated in the `dist` directory.

## Backend Connection

The frontend communicates with the FastAPI backend through Axios.

Default local backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

The Axios API client automatically attaches the JWT access token to authenticated requests.

## Deployment

Production frontend:

https://intelligent-learning-assistant-amber.vercel.app

Backend API:

https://intelligent-learning-assistant-u0ad.onrender.com

The frontend is deployed using Vercel and communicates with the deployed FastAPI backend.