
import { useState } from "react";
import api from "../services/api";

function PersonalizedLearning() {
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function recordPerformance(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.post("/learning/performance", {
        topic,
        score: Number(score),
        total_questions: Number(totalQuestions),
      });

      setPerformance(result.data);
      await loadRecommendations();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to record performance."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRecommendations() {
    try {
      const result = await api.get("/learning/recommendations");
      setRecommendations(result.data.recommendations || []);
    } catch {
      setError("Performance saved, but recommendations could not be loaded.");
    }
  }

  async function checkLevel() {
    setError("");

    try {
      const result = await api.post("/learning/adaptive-level", {
        score: performance?.percentage ?? 0,
      });

      setLevel(result.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to determine learning level."
      );
    }
  }

  return (
    <div className="learning-page">
      <h1>Personalized Learning</h1>
      <p>Track your performance and discover lessons to improve weak topics.</p>

      <form onSubmit={recordPerformance} className="learning-form">
        <label>Topic</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: Python Loops"
          required
        />

        <label>Score</label>
        <input
          type="number"
          min="0"
          step="any"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
        />

        <label>Total Questions</label>
        <input
          type="number"
          min="1"
          step="any"
          value={totalQuestions}
          onChange={(e) => setTotalQuestions(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Performance"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {performance && (
        <div className="learning-result">
          <h2>Performance Recorded</h2>
          <p>Topic: {performance.topic}</p>
          <p>Score: {performance.score}/{performance.total_questions}</p>
          <p>Percentage: {performance.percentage}%</p>
          <button onClick={checkLevel}>Check Learning Level</button>
        </div>
      )}

      {level && (
        <div className="learning-result">
          <h2>Adaptive Learning Level</h2>
          <pre>{JSON.stringify(level, null, 2)}</pre>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="learning-result">
          <h2>Recommended Lessons</h2>
          {recommendations.map((item, index) => (
            <p key={index}>
              {typeof item === "string"
                ? item
                : item.title || item.topic || JSON.stringify(item)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default PersonalizedLearning;
