import { useState } from "react";
import DeviceTable from "../components/DeviceTable";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  return (
    <main className="dashboard">
      <Navbar />
      <StatCard />
      <section className="device-stat">
        <header>
          <h2>Device Status</h2>
          <button className="add-btn" onClick={() => setIsAddOpen(true)}>
            +Add Device
          </button>
        </header>
        <DeviceTable isAddOpen={isAddOpen} setIsAddOpen={setIsAddOpen} />
      </section>
    </main>
  );
}
