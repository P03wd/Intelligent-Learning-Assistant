
import { useState, useEffect, useRef } from "react";
import api from "../services/api";

function Chatbot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [selectedConversations, setSelectedConversations] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const response = await api.get("/chat/conversations");
      setConversations(response.data.conversations || []);
    } catch {
      setError("Unable to load conversation history.");
    }
  }

  async function openConversation(id) {
    setLoading(true);
    setError("");
    setSelectedMessages([]);

    try {
      const response = await api.get(`/chat/conversations/${id}`);

      setConversationId(response.data.conversation_id);
      setMessages(response.data.messages || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load this conversation."
      );
    } finally {
      setLoading(false);
    }
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setQuestion("");
    setError("");
    setSelectedMessages([]);
  }

  function toggleConversation(id) {
    setSelectedConversations((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function toggleMessage(id) {
    setSelectedMessages((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  async function handleDeleteSelectedConversations() {
    if (selectedConversations.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedConversations.length} selected conversation(s) and all their messages?`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      for (const id of selectedConversations) {
        await api.delete(`/chat/conversations/${id}`);
      }

      if (selectedConversations.includes(conversationId)) {
        setConversationId(null);
        setMessages([]);
        setQuestion("");
        setSelectedMessages([]);
      }

      setSelectedConversations([]);
      await loadConversations();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete all selected conversations."
      );
      await loadConversations();
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSelectedMessages() {
    if (selectedMessages.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedMessages.length} selected message(s)?`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      for (const id of selectedMessages) {
        await api.delete(`/chat/messages/${id}`);
      }

      setMessages((previous) =>
        previous.filter(
          (message) => !selectedMessages.includes(message.message_id)
        )
      );

      setSelectedMessages([]);
      await loadConversations();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete all selected messages."
      );

      if (conversationId) {
        try {
          const response = await api.get(
            `/chat/conversations/${conversationId}`
          );
          setMessages(response.data.messages || []);
        } catch {
          setError("Unable to refresh the conversation after deletion.");
        }
      }

      await loadConversations();
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!file || uploading) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadMessage("");
    setUploadError("");

    try {
      const response = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadMessage(
        response.data.message ||
          "Document uploaded and processed successfully. You can now ask questions about it."
      );

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.detail ||
          "Document upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

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

      await loadConversations();
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
      <div className="chatbot-header">
        <h1>AI Learning Chatbot</h1>
        <p>
          Ask questions based on your uploaded learning materials.
        </p>
      </div>

      {/* Selection and deletion toolbar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        <button
          type="button"
          onClick={handleDeleteSelectedConversations}
          disabled={loading || selectedConversations.length === 0}
        >
          Delete Selected Chats ({selectedConversations.length})
        </button>

        <button
          type="button"
          onClick={handleDeleteSelectedMessages}
          disabled={loading || selectedMessages.length === 0}
        >
          Delete Selected Messages ({selectedMessages.length})
        </button>
      </div>

      <div className="chat-layout">
        <aside className="chat-history">
          <button
            className="new-conversation-btn"
            onClick={startNewConversation}
            disabled={loading}
          >
            <span>+</span> New Conversation
          </button>

          <div className="history-section">
            <h3>Previous Conversations</h3>

            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.conversation_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedConversations.includes(
                      conversation.conversation_id
                    )}
                    onChange={() =>
                      toggleConversation(conversation.conversation_id)
                    }
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      openConversation(conversation.conversation_id)
                    }
                    disabled={loading}
                    className="conversation-item"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    {conversation.title}
                  </button>
                </div>
              ))
            ) : (
              <p className="no-conversations">
                No previous conversations.
              </p>
            )}
          </div>
        </aside>

        <div className="chat-main">

          {/* Document upload section */}
          <div
            className="chat-upload-section"
            style={{
              padding: "15px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>Upload Learning Document</h3>

            <form
              onSubmit={handleUpload}
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(event) =>
                  setFile(event.target.files[0] || null)
                }
                disabled={uploading}
              />

              <button
                type="submit"
                disabled={!file || uploading}
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </form>

            {file && (
              <p>Selected file: {file.name}</p>
            )}

            {uploadMessage && (
              <p className="success-message">{uploadMessage}</p>
            )}

            {uploadError && (
              <p className="error-message">{uploadError}</p>
            )}
          </div>

          {/* Chat messages */}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                className="chat-message"
                key={message.message_id || index}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {message.message_id && (
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(
                        message.message_id
                      )}
                      onChange={() =>
                        toggleMessage(message.message_id)
                      }
                      disabled={loading}
                    />
                  )}

                  <strong>
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </strong>
                </div>

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

            {loading && (
              <p>AI Assistant is preparing your answer...</p>
            )}
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="chat-form">
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a learning question..."
              maxLength={2000}
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
