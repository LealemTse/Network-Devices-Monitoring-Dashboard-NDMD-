import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
const BACKEND_URL = "http://localhost:3000/devices";

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
        const res = await fetch(BACKEND_URL, { signal: controller.signal });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

        const devices = await res.json();

        const flattened = devices.flatMap((dev) =>
          dev.logs.map((log) => ({
            ...log,
            deviceName: dev.name,
            parentDeviceId: dev.id,
          }))
        );

        setAllLogs(
          flattened.sort((a, b) => new Date(b.time) - new Date(a.time))
        );
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
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
                <th>Status</th>
                <th>Latency</th>
                <th>Packet Loss</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={`${log.parentDeviceId}-${log.time}`}>
                    <td data-label="Time">{log.time}</td>
                    <td data-label="Device ID">{log.parentDeviceId}</td>
                    <td
                      data-label="Status"
                      className={`status-text ${log.status}`}
                    >
                      {log.status}
                    </td>
                    <td data-label="Latency">{log.latency}ms</td>
                    <td data-label="Packet Loss">{log.packetLoss}%</td>
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
