
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Auth() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const response = await api.post("/auth/register", {
          email,
          password,
        });

        setMessage(response.data.message + " Please log in.");
        setIsRegister(false);
        setPassword("");
      } else {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await api.post("/auth/login", formData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        localStorage.setItem(
          "access_token",
          response.data.access_token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>LearnAI</h1>

        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>

        <p>
          {isRegister
            ? "Register to start your personalized learning journey."
            : "Log in to continue learning with LearnAI."}
        </p>

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          minLength={8}
          maxLength={128}
          required
        />

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
              ? "Register"
              : "Login"}
        </button>

        <div style={styles.switch}>
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setError("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  form: {
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "32px",
    borderRadius: "12px",
    background: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  switch: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "10px",
  },
  success: {
    color: "green",
    fontSize: "14px",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
};

export default Auth;
