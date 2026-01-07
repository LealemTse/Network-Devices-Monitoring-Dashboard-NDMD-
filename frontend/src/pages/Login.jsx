import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("admin"); // Default to admin
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store token in localStorage
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Redirect to Dashboard
        navigate("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Is the backend running?");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1 className="login-title">Login to NDMD</h1>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <label className="login-label label" htmlFor="login-admin">
          Username
        </label>
        <input
          id="login-admin"
          type="text"
          className="input login-admin"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label className="login-label label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          className="input login-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-submit" type="submit">Login</button>
        <Link className="forgot-password" to="/forgot_password">
          Forgot Password
        </Link>
      </form>
    </div>
  );
}
