
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
  const [deletingId, setDeletingId] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  async function fetchDocuments() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await api.get("/documents/");
      setDocuments(response.data);
    } catch (err) {
      setHistoryError(
        err.response?.data?.detail ||
          "Unable to load document history."
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
      const response = await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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

  async function handlePreview(doc) {
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      setError("Please allow pop-ups to preview documents.");
      return;
    }

    setPreviewingId(doc.document_id);
    setMessage("");
    setError("");

    try {
      const response = await api.get(
        `/documents/${doc.document_id}/preview`,
        { responseType: "blob" }
      );

      const fileUrl = URL.createObjectURL(response.data);
      previewWindow.location.href = fileUrl;

      setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    } catch (err) {
      previewWindow.close();

      setError(
        err.response?.data?.detail ||
          "Unable to preview document. Please try again."
      );
    } finally {
      setPreviewingId(null);
    }
  }

  async function handleDownload(doc) {
    setDownloadingId(doc.document_id);
    setMessage("");
    setError("");

    try {
      const response = await api.get(
        `/documents/${doc.document_id}/download`,
        { responseType: "blob" }
      );

      const fileUrl = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");

      link.href = fileUrl;
      link.download = doc.filename;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);

      setMessage("Document downloaded successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to download document. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(doc) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.filename}"? This will remove the document and its indexed content.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(doc.document_id);
    setMessage("");
    setError("");

    try {
      const response = await api.delete(
        `/documents/${doc.document_id}`
      );

      setMessage(
        response.data.file_cleanup_pending
          ? "Document deleted, but its uploaded file could not be removed from storage."
          : "Document deleted successfully."
      );

      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete document. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const buttonStyle = {
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.12)",
  };

  const disabledButtonStyle = {
    opacity: 0.6,
    cursor: "not-allowed",
  };

  return (
    <div>
      <h1>Learning Materials</h1>

      <p>
        Upload PDF, DOCX or TXT files to build your learning knowledge base.
      </p>

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

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      <hr />

      <h2>Uploaded Documents</h2>

      {historyLoading && (
        <p>Loading document history...</p>
      )}

      {historyError && (
        <p className="error-message">{historyError}</p>
      )}

      {!historyLoading &&
        !historyError &&
        documents.length === 0 && (
          <p>No documents uploaded yet.</p>
        )}

      {!historyLoading &&
        !historyError &&
        documents.length > 0 && (
          <div>
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className="document-card"
              >
                <h3>{doc.filename}</h3>

                <p>File type: {doc.file_type}</p>
                <p>Characters: {doc.character_count}</p>
                <p>Chunks: {doc.total_chunks}</p>

                <p>
                  Uploaded:{" "}
                  {new Date(doc.uploaded_at).toLocaleString()}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "15px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => handlePreview(doc)}
                    disabled={
                      previewingId !== null ||
                      downloadingId !== null ||
                      deletingId !== null ||
                      loading
                    }
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#2563eb",
                      ...(previewingId !== null ||
                      downloadingId !== null ||
                      deletingId !== null ||
                      loading
                        ? disabledButtonStyle
                        : {}),
                    }}
                    onMouseEnter={(event) => {
                      if (
                        previewingId === null &&
                        downloadingId === null &&
                        deletingId === null &&
                        !loading
                      ) {
                        event.currentTarget.style.backgroundColor =
                          "#1d4ed8";
                        event.currentTarget.style.transform =
                          "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor =
                        "#2563eb";
                      event.currentTarget.style.transform = "none";
                    }}
                  >
                    {previewingId === doc.document_id
                      ? "Opening..."
                      : "Preview"}
                  </button>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    disabled={
                      downloadingId !== null ||
                      previewingId !== null ||
                      deletingId !== null ||
                      loading
                    }
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#059669",
                      ...(downloadingId !== null ||
                      previewingId !== null ||
                      deletingId !== null ||
                      loading
                        ? disabledButtonStyle
                        : {}),
                    }}
                    onMouseEnter={(event) => {
                      if (
                        downloadingId === null &&
                        previewingId === null &&
                        deletingId === null &&
                        !loading
                      ) {
                        event.currentTarget.style.backgroundColor =
                          "#047857";
                        event.currentTarget.style.transform =
                          "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor =
                        "#059669";
                      event.currentTarget.style.transform = "none";
                    }}
                  >
                    {downloadingId === doc.document_id
                      ? "Downloading..."
                      : "Download"}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    disabled={
                      deletingId !== null ||
                      previewingId !== null ||
                      downloadingId !== null ||
                      loading
                    }
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#dc2626",
                      ...(deletingId !== null ||
                      previewingId !== null ||
                      downloadingId !== null ||
                      loading
                        ? disabledButtonStyle
                        : {}),
                    }}
                    onMouseEnter={(event) => {
                      if (
                        deletingId === null &&
                        previewingId === null &&
                        downloadingId === null &&
                        !loading
                      ) {
                        event.currentTarget.style.backgroundColor =
                          "#b91c1c";
                        event.currentTarget.style.transform =
                          "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor =
                        "#dc2626";
                      event.currentTarget.style.transform = "none";
                    }}
                  >
                    {deletingId === doc.document_id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default Documents;
