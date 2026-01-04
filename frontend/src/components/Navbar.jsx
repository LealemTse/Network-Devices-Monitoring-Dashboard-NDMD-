import { useState } from "react";

export default function Navbar() {
  let [active, is_active = true] = useState();
  function nav_active() {
    if (is_active) {
      active = "active";
      is_active = false;
    }
    return active;
  }
  console.log(nav_active());
  return (
    <nav className="navbar">
      <h2 className="logo">NDMD</h2>
      <ul className="nav-links">
        <li className="link">
          <a href="/">Dashboard</a>
        </li>
        <li className="link">
          <a href="/Logs">Logs</a>
        </li>
        <li className="link">
          <a href="/settings">Settings</a>
        </li>
        <li className="link">
          <a href="/helf">Help</a>{" "}
        </li>
      </ul>
      <button className="logout">Logout</button>
    </nav>
  );
}
