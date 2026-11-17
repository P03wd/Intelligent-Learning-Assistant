
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Documents from "./pages/Documents";
import CodingAssistant from "./pages/CodingAssistant";
import PersonalizedLearning from "./pages/PersonalizedLearning";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <h2>LearnAI</h2>

          <nav>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/chatbot">AI Chatbot</NavLink>
            <NavLink to="/documents">Documents</NavLink>
            <NavLink to="/coding">Coding Assistant</NavLink>
            <NavLink to="/learning">Personalized Learning</NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/coding" element={<CodingAssistant />} />
            <Route path="/learning" element={<PersonalizedLearning />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
