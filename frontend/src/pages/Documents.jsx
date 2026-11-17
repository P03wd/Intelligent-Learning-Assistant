
import { useState } from "react";
import api from "../services/api";

function Documents() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select a document.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        response.data.message || "Document uploaded and processed successfully."
      );
      setFile(null);
      event.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Document upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Learning Materials</h1>
      <p>Upload PDF, DOCX or TXT files to build your learning knowledge base.</p>

      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(event) => setFile(event.target.files[0] || null)}
        />

        <button type="submit" disabled={loading || !file}>
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {file && <p>Selected file: {file.name}</p>}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Documents;
