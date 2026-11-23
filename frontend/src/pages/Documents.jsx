
import { useEffect, useState } from "react";
import api from "../services/api";

function Documents() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  async function fetchDocuments() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await api.get("/documents/");
      setDocuments(response.data);
    } catch (err) {
      setHistoryError(
        err.response?.data?.detail || "Unable to load document history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

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
        response.data.message ||
          "Document uploaded and processed successfully."
      );

      setFile(null);
      event.target.reset();

      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Document upload failed. Please try again."
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
          onChange={(event) =>
            setFile(event.target.files[0] || null)
          }
        />

        <button type="submit" disabled={loading || !file}>
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {file && <p>Selected file: {file.name}</p>}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <hr />

      <h2>Uploaded Documents</h2>

      {historyLoading && <p>Loading document history...</p>}

      {historyError && (
        <p className="error-message">{historyError}</p>
      )}

      {!historyLoading && !historyError && documents.length === 0 && (
        <p>No documents uploaded yet.</p>
      )}

      {!historyLoading && documents.length > 0 && (
        <div>
          {documents.map((document) => (
            <div
              key={document.document_id}
              className="document-card"
            >
              <h3>{document.filename}</h3>
              <p>File type: {document.file_type}</p>
              <p>Characters: {document.character_count}</p>
              <p>Chunks: {document.total_chunks}</p>
              <p>
                Uploaded:{" "}
                {new Date(document.uploaded_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Documents;
