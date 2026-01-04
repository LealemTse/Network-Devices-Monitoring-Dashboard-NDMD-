import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const colors = {
    online: "green",
    unstable: "yellow",
    offline: "red",
  };

  return (
    <main className="dashboard">
      <Navbar />
      <section className="overview">
        <ul>
          <StatCard />
          <li className="card-count">
            <h3> Online </h3>
            <span className="count online-count">12</span>
          </li>
          <li className="card-count">
            <h3> Unstable </h3>
            <span className="count unstable-count">12</span>
          </li>
          <li className="card-count">
            <h3> Offline</h3> <span className="count offline-count">12</span>
          </li>
        </ul>
      </section>
      <div className="filter-glass "></div>
      <section className="add-modal hidden">
        <form action="" className="device-adder">
          <label htmlFor="device-name">Device Name</label>
          <input
            className="input"
            type="text"
            id="device-name"
            placeholder="Device Name"
          />

          <label htmlFor="ip-address">IP Address</label>
          <input
            className="input"
            type="text"
            id="ip-address"
            placeholder="Ip Address"
          />

          <label htmlFor="device-type">IP Address</label>
          <select
            className="recovery-security-questions"
            name=""
            id="device-type"
          >
            <option disabled value="" placeholder="Choose Device Type">
              Choose Device
            </option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="printer">Printer</option>
          </select>
        </form>
      </section>

      <section className="device-stat">
        <header>
          <h2>Device Status</h2>
          <button className="add-device">+Add Device</button>
        </header>
        <table className="col-container">
          <thead>
            <tr className="table-h">
              <th className="col">Status</th>
              <th className="col">Name</th>
              <th className="col">IP Address</th>
              <th className="col">Type</th>
              <th className="col">Last Seen</th>
              <th className="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="device-list-container">
              <td align="center" className="stat">
                Online
              </td>
              <td align="center" className="name">
                device name
              </td>
              <td align="center" className="ip-adress">
                3:3:3:3
              </td>
              <td align="center" className="type">
                {" "}
                switch
              </td>
              <td align="center" className="last-seen">
                2 <span>days</span>
              </td>
              <td align="center" className="action">
                on
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
