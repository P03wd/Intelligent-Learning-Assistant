
import { useState } from "react";
import api from "../services/api";

function CodingAssistant() {
  const [language, setLanguage] = useState("python");
  const [task, setTask] = useState("explain");
  const [code, setCode] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const result = await api.post("/coding/assist", {
        language,
        task,
        code,
        question,
      });

      setResponse(result.data.response);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to process your coding request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="coding-page">
      <h1>AI Coding Assistant</h1>
      <p>Explain, debug, generate examples and practise programming.</p>

      <form onSubmit={handleSubmit} className="coding-form">
        <label>Programming Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="sql">SQL</option>
        </select>

        <label>Task</label>
        <select value={task} onChange={(e) => setTask(e.target.value)}>
          <option value="explain">Explain Code</option>
          <option value="debug">Debug Code</option>
          <option value="example">Generate Example</option>
          <option value="practice">Practice Questions</option>
        </select>

        <label>Code (optional for examples and practice)</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          rows={9}
        />

        <label>Your Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Describe what you want help with..."
          rows={3}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Get Assistance"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {response && (
        <div className="coding-response">
          <h2>AI Response</h2>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default CodingAssistant;
