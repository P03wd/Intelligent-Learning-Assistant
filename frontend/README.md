# Intelligent Learning Assistant - Frontend

React-based frontend for the ArchintX AI-Powered Intelligent Learning Assistant.

## Features
- User registration, login, and logout
- AI chatbot with conversational follow-ups
- Document upload and course-material Q&A
- AI coding assistant for Python, C, C++, Java, and SQL
- Personalized learning dashboard
- Performance tracking and weak-topic identification
- Adaptive learning recommendations
- Personalized practice questions with answers and explanations

## Technology Stack
- React
- Vite
- JavaScript
- React Router
- React Markdown
- Recharts
- Axios

## Setup

From the `frontend` directory, install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Production Build

```bash
npm run build
```

The production files are generated in the `dist` directory.

## Backend Connection

The frontend communicates with the FastAPI backend using the `VITE_API_URL` environment variable.

Default local backend URL:

VITE_API_URL=http://127.0.0.1:8000
