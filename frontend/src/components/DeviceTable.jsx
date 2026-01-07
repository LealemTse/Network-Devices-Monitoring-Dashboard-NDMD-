// ... imports ...
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000/api/devices";

// Helper to get headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

// ... Modals (ConfirmModal, AddDeviceModal, EditDeviceModal) ...
// (Keeping modals mostly same but ensuring they pass correct data structure if needed)
// AddDeviceModal:
const AddDeviceModal = ({ isOpen, onAdd, onCancel }) => {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [mac, setMac] = useState("");
  const [status, setStatus] = useState("online");

  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, ip_address: ip, mac_address: mac, status }); // Send snake_case to match backend expectation?
    // Actually backend expects snake_case for addDevice (req.body usually defaults to what is sent).
    // deviceController.js: const { name, ip_address, mac_address } = req.body
    setName("");
    setIp("");
    setMac("");
    setStatus("online");
  };
  // ... JSX ...
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Device</h3>
        <br></br>
        <form onSubmit={handleSubmit} className="add-form">
          <label className="labels">Name: </label>
          <input className="input-field" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="labels">IP Address: </label>
          <input className="input-field" placeholder="IP Address" value={ip} onChange={(e) => setIp(e.target.value)} required />
          <label className="labels">MAC Address: </label>
          <input className="input-field" placeholder="MAC Address" value={mac} onChange={(e) => setMac(e.target.value)} required />

          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" className="confirm-btn">Add Device</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditDeviceModal = ({ isOpen, device, onUpdate, onCancel }) => {
  const [name, setName] = useState(device?.name || "");
  const [ip, setIp] = useState(device?.ipAddress || ""); // Displays camelCase from local state
  const [mac, setMac] = useState(device?.macAddress || "");

  useEffect(() => {
    if (device) {
      setName(device.name || "");
      setIp(device.ipAddress || "");
      setMac(device.macAddress || "");
    }
  }, [device]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass formatted for backend
    onUpdate({ ...device, name, ip_address: ip, mac_address: mac });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Device Details</h3>
        <br></br>
        <form onSubmit={handleSubmit} className="add-form">
          <label className="labels">Name: </label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="labels">IP Address: </label>
          <input className="input-field" value={ip} onChange={(e) => setIp(e.target.value)} required />
          <label className="labels">MAC Address: </label>
          <input className="input-field" value={mac} onChange={(e) => setMac(e.target.value)} required />

          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" className="confirm-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ... DeviceRow ...
const DeviceRow = ({ device, openMenuId, setOpenMenuId, triggerDeletePrompt, setIsEditOpen, setSelectedDevice }) => {
  const dropdownRef = useRef(null);
  // ... (keep logic same)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null && Number(openMenuId) === Number(device.id) && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId, device.id, setOpenMenuId]);

  return (
    <tr key={device.id}>
      <td data-label="Name">{device.name}</td>
      <td data-label="Status" className="status-cell">
        <FontAwesomeIcon
          icon={device.status === "online" ? faCheckCircle : device.status === "unstable" ? faExclamationTriangle : faTimesCircle}
          style={{ color: device.status === "online" ? "#22c55e" : device.status === "unstable" ? "#f59e0b" : "#ef4444" }}
        />
      </td>
      <td data-label="IP Address">{device.ipAddress}</td>
      <td data-label="MAC Address">{device.macAddress}</td>
      <td data-label="Actions" className="action-cells">
        <div className="dropdown-container" ref={dropdownRef}>
          <button className="menu-trigger" onClick={() => {
            const currentId = Number(device.id);
            const openId = openMenuId !== null ? Number(openMenuId) : null;
            setOpenMenuId(openId === currentId ? null : currentId);
          }}>
            <FontAwesomeIcon icon={faEllipsisV} style={{ color: "#4a148c", fontSize: "1.3rem" }} />
          </button>
          {openMenuId === device.id && (
            <div className="dropdown-menu">
              <button onClick={() => { setSelectedDevice(device); setIsEditOpen(true); setOpenMenuId(null); }}>Edit Device</button>
              <button onClick={() => triggerDeletePrompt(device)}>Remove Device</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// ... DeviceTable ...
function DeviceTable({ isAddOpen, setIsAddOpen }) {
  const [info, setInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const navigate = useNavigate();

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => { setToast({ show: false, message: "" }); }, 3000);
  };

  const triggerDeletePrompt = (device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  useEffect(() => {
    const headers = getAuthHeaders();
    fetch(BACKEND_URL, { headers })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Failed to fetch devices");
        return res.json();
      })
      .then((data) => {
        // Backend returns: { devices: [...] }
        const rawDevices = data.devices || [];

        // Map to Frontend Format (camelCase)
        const cleanedData = rawDevices.map((device) => ({
          ...device,
          id: Number(device.id),
          ipAddress: device.ip_address, // Map snake to camel
          macAddress: device.mac_address // Map snake to camel
        }));
        setInfo(cleanedData);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error loading device information:", error.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleConfirmDelete = () => {
    fetch(`${BACKEND_URL}/${selectedDevice.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (res.ok) {
          setInfo((prev) => prev.filter((d) => Number(d.id) !== Number(selectedDevice.id)));
          setIsModalOpen(false);
          showToast("Device is removed from the dashboard.");
        } else {
          alert(`Error:${res.status}`);
        }
      })
      .catch((error) => console.error("Delete failed", error));
  };

  const handleAddDevice = (deviceData) => {
    // deviceData comes from AddDeviceModal in snake_case keys as we set it there
    fetch(BACKEND_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData),
    })
      .then((res) => res.json())
      .then((data) => {
        // data.device is field in response
        const newDev = data.device;
        const formatted = {
          ...newDev,
          id: Number(newDev.id),
          ipAddress: newDev.ip_address,
          macAddress: newDev.mac_address
        };

        setInfo([...info, formatted]);
        setIsAddOpen(false);
        showToast("Device added successfully");
      })
      .catch((error) => alert("Could not add device:", error.message));
  };

  const handleUpdateDevice = (updatedDevice) => {
    const { id, name, ip_address, mac_address } = updatedDevice; // Expecting snake_case passed from Modal
    fetch(`${BACKEND_URL}/${id}`, {
      method: "PUT", // Controller uses PUT or Logic uses PUT? Router says PUT.
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, ip_address, mac_address }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update Failed");
        return res.json();
      })
      .then(() => {
        // Optimistic update locally
        setInfo(
          info.map((d) =>
            Number(d.id) === Number(id)
              ? { ...d, name, ipAddress: ip_address, macAddress: mac_address }
              : d
          )
        );
        setIsEditOpen(false);
        setOpenMenuId(null);
        showToast("Device updated successfully");
      })
      .catch((error) => alert("Update failed:" + error.message));
  };

  if (loading) return <p>Loading device table...</p>;

  return (
    <div className="device-table-container">
      <AddDeviceModal isOpen={isAddOpen} onAdd={handleAddDevice} onCancel={() => setIsAddOpen(false)} />
      <ConfirmModal isOpen={isModalOpen} onConfirm={handleConfirmDelete} onCancel={() => setIsModalOpen(false)} message={`Are you sure you want to delete ${selectedDevice?.name}?`} />
      <EditDeviceModal key={selectedDevice?.id} isOpen={isEditOpen} device={selectedDevice} onUpdate={handleUpdateDevice} onCancel={() => setIsEditOpen(false)} />

      <table className="device-pannel">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>IP Address</th>
            <th>MAC Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {info.map((device) => (
            <DeviceRow key={device.id} device={device} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} triggerDeletePrompt={triggerDeletePrompt} setIsEditOpen={setIsEditOpen} setSelectedDevice={setSelectedDevice} />
          ))}
        </tbody>
      </table>
      {toast.show && (
        <div className="toast-notification">
          <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: "10px" }} />
          {toast.message}
        </div>
      )}
    </div>
  );
}
export default DeviceTable;
