
import { useState, useEffect } from "react";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function PersonalizedLearning() {
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [performance, setPerformance] = useState(null);
  const [savedPerformance, setSavedPerformance] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [practiceLanguage, setPracticeLanguage] = useState("python");
  const [practiceResult, setPracticeResult] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState("");

  useEffect(() => {
    loadSavedPerformance();
    loadRecommendations();
  }, []);

  async function loadSavedPerformance() {
    try {
      const result = await api.get("/learning/performance");
      const summary = result.data.performance_summary || {};

      const records = Object.entries(summary).map(([topic, data]) => ({
        topic,
        average_score: data.average_score,
        attempts: data.attempts,
      }));

      setSavedPerformance(records);
    } catch {
      setError("Unable to load saved performance.");
    }
  }

  async function loadRecommendations() {
    try {
      const result = await api.get("/learning/recommendations");
      setRecommendations(result.data.recommendations || []);
    } catch {
      setError("Unable to load recommendations.");
    }
  }

  async function recordPerformance(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setLevel(null);
    setPracticeResult(null);

    try {
      const result = await api.post("/learning/performance", {
        topic,
        score: Number(score),
        total_questions: Number(totalQuestions),
      });

      setPerformance(result.data.performance);

      await loadSavedPerformance();
      await loadRecommendations();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to record performance."
      );
    } finally {
      setLoading(false);
    }
  }

  async function checkLevel() {
    if (!performance) return;

    setError("");

    try {
      const result = await api.post("/learning/adaptive-level", {
        topic: performance.topic,
        average_score: performance.percentage,
      });

      setLevel(result.data.learning_adaptation);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to determine learning level."
      );
    }
  }

  async function generatePracticeQuestions(selectedTopic) {
    setPracticeLoading(selectedTopic);
    setPracticeResult(null);
    setError("");

    try {
      const result = await api.post("/learning/practice-questions", {
        topic: selectedTopic,
        language: practiceLanguage,
      });

      setPracticeResult(result.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to generate practice questions."
      );
    } finally {
      setPracticeLoading("");
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
          step="1"
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
          <p>
            Score: {performance.score}/{performance.total_questions}
          </p>
          <p>Percentage: {performance.percentage}%</p>

          <button onClick={checkLevel}>Check Learning Level</button>
        </div>
      )}

      {level && (
        <div className="learning-result">
          <h2>Adaptive Learning Level</h2>
          <p><strong>Topic:</strong> {level.topic}</p>
          <p><strong>Average Score:</strong> {level.average_score}%</p>
          <p>
            <strong>Learning Level:</strong>{" "}
            {level.learning_level?.toUpperCase()}
          </p>
          <p>
            <strong>Learning Instructions:</strong>
            <br />
            {level.instructions}
          </p>
        </div>
      )}

      <div className="learning-result">
        <h2>Saved Performance History</h2>

        {savedPerformance.length > 0 ? (
          savedPerformance.map((item) => (
            <div key={item.topic}>
              <p><strong>Topic:</strong> {item.topic}</p>
              <p><strong>Average Score:</strong> {item.average_score}%</p>
              <p><strong>Attempts:</strong> {item.attempts}</p>
              <hr />
            </div>
          ))
        ) : (
          <p>No performance records saved yet.</p>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="learning-result">
          <h2>Recommended Lessons</h2>

          {recommendations.map((item, index) => (
            <div key={item.topic || index}>
              <h3>{item.topic}</h3>
              <p>Average Score: {item.average_score}%</p>

              <ul>
                {(item.recommended_lessons || []).map((lesson, lessonIndex) => (
                  <li key={lessonIndex}>{lesson}</li>
                ))}
              </ul>

              <button
                onClick={() => generatePracticeQuestions(item.topic)}
                disabled={practiceLoading !== ""}
              >
                {practiceLoading === item.topic
                  ? "Generating..."
                  : "Generate Practice Questions"}
              </button>
            </div>
          ))}
        </div>
      )}

      {practiceResult && (
        <div className="learning-result">
          <h2>Personalized Practice Questions</h2>
          <p><strong>Topic:</strong> {practiceResult.topic}</p>
          <p><strong>Learning Level:</strong> {practiceResult.learning_level}</p>
          <p><strong>Average Score:</strong> {practiceResult.average_score}%</p>
          <div className="practice-markdown">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h3: ({ children }) => (
        <h3
          style={{
            marginTop: "35px",
            marginBottom: "15px",
            paddingTop: "15px",
          }}
        >
          {children}
        </h3>
      ),
      h2: ({ children }) => (
        <h2 style={{ marginTop: "20px", marginBottom: "12px" }}>
          {children}
        </h2>
      ),
      p: ({ children }) => (
        <p style={{ marginTop: "8px", marginBottom: "8px", lineHeight: 1.7 }}>
          {children}
        </p>
      ),
    }}
  >
    {practiceResult.practice_questions}
  </ReactMarkdown>
</div>
        </div>
      )}

      <div className="learning-result">
        <h2>Practice Language</h2>
        <select
          value={practiceLanguage}
          onChange={(e) => setPracticeLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="sql">SQL</option>
        </select>
      </div>
    </div>
  );
}
export default PersonalizedLearning;