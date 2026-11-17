
import { useState } from "react";
import api from "../services/api";

function Chatbot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    setMessages((previous) => [
      ...previous,
      { role: "user", content: currentQuestion },
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/chat/ask", {
        question: currentQuestion,
        conversation_id: conversationId,
        top_k: 3,
      });

      setConversationId(response.data.conversation_id);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources || [],
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to connect to the learning assistant."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot-page">
      <h1>AI Learning Chatbot</h1>
      <p>Ask questions based on your uploaded learning materials.</p>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div className="chat-message" key={index}>
            <strong>
              {message.role === "user" ? "You" : "AI Assistant"}
            </strong>

            <p>{message.content}</p>

            {message.sources?.length > 0 && (
              <div>
                <strong>Sources:</strong>
                {message.sources.map((source, sourceIndex) => (
                  <p key={sourceIndex}>
                    {source.filename || source}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && <p>AI Assistant is preparing your answer...</p>}
      </div>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a learning question..."
          maxLength={2000}
        />

        <button type="submit" disabled={loading || !question.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbot;
