import { useState, useEffect } from "react";
//state to hold data
const StatCard = () => {
  //fetch from server
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/devices") //BackendURL
      .then((res) => res.json())
      .then((data) => {
        setDevices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch devices:", err);
        setLoading(false);
      });
  }, []);
  if (loading) return <div className="loading">Updating Status...</div>;

  const total = devices.length;
  const online = devices.filter((d) => d.status === "online").length;
  const unstable = devices.filter((d) => d.status === "unstable").length;
  const offline = devices.filter((d) => d.status === "offline").length;

  return (
    <div className="status-grid">
      <div className="status-card total">
        <div className="status-label">Total</div>
        <div className="status-value">{total}</div>
      </div>
      <div className="status-card ">
        <div className="status-label">Online</div>
        <div className="status-value online">{online}</div>
      </div>

      <div className="status-card">
        <div className="status-label">Unstable</div>
        <div className="status-value unstable">{unstable}</div>
      </div>

      <div className="status-card ">
        <div className="status-label ">Offline</div>
        <div className="status-value offline">{offline}</div>
      </div>
    </div>
  );
};
export default StatCard;
