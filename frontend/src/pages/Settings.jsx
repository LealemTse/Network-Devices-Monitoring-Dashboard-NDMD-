import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
const BACKEND_URL = "http://localhost:3000/configs";

export default function Settings() {
  const [formData, setFormData] = useState({
    pingInterval: "",
    pingTimeout: "",
    retryCount: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch(BACKEND_URL)
      .then((res) => res.json())
      .then((data) => setFormData(data))
      .catch(() =>
        setMessage({ type: "error", text: "Failed to load current settings." })
      );
  }, []);

  //to update state when typed and convert number to string
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(BACKEND_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setMessage({ type: "success", text: "Setting saved succesfully!" });
      } else {
        throw new Error();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save settings." + error.message,
      });
    } finally {
      setLoading(false);
    }
    // Auto-hide the sucess and error message after 3 seconds
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 1500);
  };

  return (
    <div className="settings">
      <Navbar />
      <div className="settings-config">
        <h1 className="logs-h1">System Configuration</h1>

        {/* Feedback for the user */}
        {message.text && (
          <p className={`status-msg ${message.type}`}>{message.text}</p>
        )}

        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ping Interval (ms)</label>
            <input
              type="number"
              name="pingInterval"
              value={formData.pingInterval}
              onChange={handleChange}
              placeholder="3000"
            />
          </div>

          <div className="form-group">
            <label>Ping Timeout (seconds)</label>
            <input
              type="number"
              name="pingTimeout"
              value={formData.pingTimeout}
              onChange={handleChange}
              placeholder="5"
            />
          </div>

          <div className="form-group">
            <label>Retry Count</label>
            <input
              type="number"
              name="retryCount"
              value={formData.retryCount}
              onChange={handleChange}
              placeholder="3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="save-settings-btn"
          >
            {loading ? "Saving ..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
