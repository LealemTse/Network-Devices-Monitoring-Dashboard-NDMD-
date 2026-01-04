import Navbar from "../components/Navbar";

export default function Logs() {
  return (
    <main className="logs">
      <Navbar />
      <h3 className="login-title">Logs</h3>
      <form action="" className="stat-select">
        <select
          className="recovery-security-questions"
          name=""
          id="log-stat-select"
        >
          <option value="all_statuses">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="unstable">Unstable</option>
        </select>
      </form>
    </main>
  );
}
