@echo off
cd /d D:\Archintx\Intelligent-Learning-Assistant\backend
start "LearnAI Backend" cmd /k "..\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

cd /d D:\Archintx\Intelligent-Learning-Assistant\frontend
start "LearnAI Frontend" cmd /k "npm run dev"

exit