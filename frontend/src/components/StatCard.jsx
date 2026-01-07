import { useState, useEffect } from "react";
//state to hold data
const StatCard = () => {
  //fetch from server
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    unstableDevices: 0,
    offlineDevices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/dashboard/overview", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Updating Status...</div>;

  return (
    <div className="status-grid">
      <div className="status-card total">
        <div className="status-label">Total</div>
        <div className="status-value">{stats.totalDevices}</div>
      </div>
      <div className="status-card ">
        <div className="status-label">Online</div>
        <div className="status-value online">{stats.onlineDevices}</div>
      </div>

      <div className="status-card">
        <div className="status-label">Unstable</div>
        <div className="status-value unstable">{stats.unstableDevices}</div>
      </div>

      <div className="status-card ">
        <div className="status-label ">Offline</div>
        <div className="status-value offline">{stats.offlineDevices}</div>
      </div>
    </div>
  );
};
export default StatCard;
