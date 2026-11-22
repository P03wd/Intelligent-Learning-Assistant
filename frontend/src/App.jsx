
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Documents from "./pages/Documents";
import CodingAssistant from "./pages/CodingAssistant";
import PersonalizedLearning from "./pages/PersonalizedLearning";
import Auth from "./pages/Auth";

import "./App.css";

function ProtectedLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
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

        <button onClick={handleLogout}>Logout</button>
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
