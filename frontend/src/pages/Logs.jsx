import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";

// Correct Backend API for Status Logs
const LOGS_URL = "http://localhost:5000/api/monitoring/status-logs";

export default function Logs() {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all_statuses");

  useEffect(() => {
    const controller = new AbortController(); // To cancel fetch if component unmounts

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(LOGS_URL, {
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

        const data = await res.json();
        const logs = data.logs || [];

        // Backend returns: { id, device_id, device_name, status, latency, time }
        // Map to internal format if needed
        const mappedLogs = logs.map(log => ({
          ...log,
          deviceName: log.device_name,
          parentDeviceId: log.device_id,
        }));

        setAllLogs(mappedLogs);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Could not load system logs. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    return () => controller.abort(); // Cleanup
  }, []);

  // useMemo optimizes performance for large lists
  const filteredLogs = useMemo(() => {
    if (filterStatus === "all_statuses") return allLogs;
    return allLogs.filter((log) => log.status === filterStatus);
  }, [allLogs, filterStatus]);

  return (
    <main className="logs">
      <Navbar />
      <div className="device-stat">
        <header>
          <h1 className="logs-h1">System Logs</h1>
        </header>

        <section className="controls">
          <select
            className="log-stat-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter logs by status"
          >
            <option value="all_statuses">All Statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unstable">Unstable</option>
          </select>
        </section>

        {loading && <p className="status-msg">Loading logs...</p>}
        {error && <p className="status-msg error">{error}</p>}

        {!loading && !error && (
          <table className="device-pannel">
            <thead>
              <tr>
                <th>Time</th>
                <th>Device ID</th>
                <th>Device Name</th>
                <th>Status</th>
                <th>Latency</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={`${log.id}-${log.time}`}>
                    <td data-label="Time">{new Date(log.time).toLocaleString()}</td>
                    <td data-label="Device ID">{log.parentDeviceId}</td>
                    <td data-label="Device Name">{log.deviceName}</td>
                    <td
                      data-label="Status"
                      className={`status-text ${log.status}`}
                    >
                      {log.status}
                    </td>
                    <td data-label="Latency">{log.latency}ms</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No logs found for this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
