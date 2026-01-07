import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect, useRef } from "react";

//use Effect hook to trigger fetch handles "Side Effects" things that happen outside of React's control like fetching data from server
//useState states to hold data

const BACKEND_URL = "http://localhost:3000/devices";

//modals for pop ups
const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Are you sure?</h3>
        <br></br>
        <p>{message}</p>
        <br></br>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

//Adding Devices
const AddDeviceModal = ({ isOpen, onAdd, onCancel }) => {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [mac, setMac] = useState("");
  const [status, setStatus] = useState("online"); //default

  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    //create device object to send to the server
    onAdd({ name, ipAddress: ip, macAddress: mac, status: status });
    setName("");
    setIp("");
    setMac("");
    setStatus("online"); //set default status
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add New Device</h3>
        <br></br>
        <form onSubmit={handleSubmit} className="add-form">
          <label className="labels">Name: </label>
          <input
            title="Enter Device Name"
            className="input-field"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="labels">IP Address: </label>
          <input
            title="Enter device IP Address "
            className="input-field"
            placeholder="IP Address"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            required
          />
          <label className="labels">MAC Address: </label>
          <input
          title="Enter the MAC Address"
            className="input-field"
            placeholder="MAC Address"
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn">
              Add Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditDeviceModal = ({ isOpen, device, onUpdate, onCancel }) => {
  // Initialize state with existing device data
  const [name, setName] = useState(device?.name || "");
  const [ip, setIp] = useState(device?.ipAddress || "");
  const [mac, setMac] = useState(device?.macAddress || "");

  useEffect(() => {
    if (device) {
      setName(device.name || "");
      setIp(device.ipAddress || "");
      setMac(device.macAddress || "");
    }
  }, [device]);

  if (!isOpen) return null;
  // Update local state whenever the "device" prop changes

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass back ONLY the edited fields + the original ID
    onUpdate({ ...device, name, ipAddress: ip, macAddress: mac });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Device Details</h3>
        <br></br>
        <form onSubmit={handleSubmit} className="add-form">
          <label className="labels">Name: </label>
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="labels">IP Address: </label>

          <input
            className="input-field"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            required
          />
          <label className="labels">MAC Address: </label>
          <input
            className="input-field"
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            required
          />

          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// This ensures each row has its own private "click-outside" listener
const DeviceRow = ({
  device,
  openMenuId,
  setOpenMenuId,
  triggerDeletePrompt,
  setIsEditOpen,
  setSelectedDevice,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId !== null &&
        Number(openMenuId) === Number(device.id) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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
          icon={
            device.status === "online"
              ? faCheckCircle
              : device.status === "unstable"
              ? faExclamationTriangle
              : faTimesCircle
          }
          style={{
            color:
              device.status === "online"
                ? "#22c55e"
                : device.status === "unstable"
                ? "#f59e0b"
                : "#ef4444",
          }}
        />
      </td>
      <td data-label="IP Address">{device.ipAddress}</td>
      <td data-label="MAC Address">{device.macAddress}</td>
      <td data-label="Actions" className="action-cells">
        <div className="dropdown-container" ref={dropdownRef}>
          <button
            className="menu-trigger"
            onClick={() => {
              const currentId = Number(device.id);
              const openId = openMenuId !== null ? Number(openMenuId) : null;
              setOpenMenuId(openId === currentId ? null : currentId);
            }}
          >
            <FontAwesomeIcon
              icon={faEllipsisV}
              style={{ color: "#4a148c", fontSize: "1.3rem" }}
            />
          </button>
          {openMenuId === device.id && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  setSelectedDevice(device);
                  setIsEditOpen(true);
                  setOpenMenuId(null);
                }}
              >
                Edit Device
              </button>
              <button onClick={() => triggerDeletePrompt(device)}>
                Remove Device
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

function DeviceTable({ isAddOpen, setIsAddOpen }) {
  const [info, setInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const triggerDeletePrompt = (device) => {
    setSelectedDevice(device); // Store the device we want to delete
    setIsModalOpen(true); // Open the modal
    setOpenMenuId(null); // Close the meatball menu
  };

  //

  useEffect(() => {
    fetch(BACKEND_URL) //backendUrl
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch devices");
        return res.json();
      })
      .then((data) => {
        // Professional Tip: Ensure IDs are numbers as soon as they arrive
        const cleanedData = data.map((device) => ({
          ...device,
          id: Number(device.id),
        }));
        setInfo(cleanedData);
        setLoading(false);
      })
      .catch((error) =>
        console.log("Error loading device information:", error.message)
      );
  }, []); //The Dependency Array []: If you leave it empty at the end, the code inside runs only once when the page first loads (perfect for loading your initial device list).

  //delete function
  const handleConfirmDelete = () => {
    fetch(`${BACKEND_URL}/${selectedDevice.id}`, {
      //backendurl
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          setInfo((prev) =>
            prev.filter((d) => Number(d.id) !== Number(selectedDevice.id))
          );
          setIsModalOpen(false);
          showToast("Device is removed from the dashboard.");
        } else {
          alert(`Error:${res.status}`);
        }
      })
      .catch((error) => console.error("Delete failed", error));
  };

  //Adding function
  const handleAddDevice = (deviceData) => {
    const newDevice = {
      name: deviceData.name,
      ipAddress: deviceData.ipAddress,
      macAddress: deviceData.macAddress,
      status: deviceData.status,
      logs: [],
    };
    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDevice),
    })
      .then((res) => res.json())
      .then((data) => {
        setInfo([...info, { ...data, id: Number(data.id) }]);
        setIsAddOpen(false);
      })
      .catch((error) => alert("Could not add device:", error.message));
  };

  //Editing function
  const handleUpdateDevice = (updatedDevice) => {
    const { id, name, ipAddress, macAddress } = updatedDevice;
    fetch(`${BACKEND_URL}/${id}`, {
      method: "PATCH", // Use PUT to replace the object or PATCH to update fields
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ipAddress, macAddress }), // Includes original status
    })
      .then((res) => res.json())
      .then((data) => {
        // Update the local state array with the new data
        setInfo(
          info.map((d) =>
            Number(d.id) === Number(data.id)
              ? { ...data, id: Number(data.id) }
              : d
          )
        );
        setIsEditOpen(false);
        setOpenMenuId(null);
      })
      .catch((error) => alert("Update failed:" + error.message));
  };

  if (loading) return <p>Loading device table...</p>;

  return (
    <div className="device-table-container">
      <AddDeviceModal
        isOpen={isAddOpen}
        onAdd={handleAddDevice}
        onCancel={() => setIsAddOpen(false)}
      />
      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
        message={`Are you sure you want to delete ${selectedDevice?.name}?`}
      />

      <EditDeviceModal
        key={selectedDevice?.id} // This forces the modal to reset every time the device changes
        isOpen={isEditOpen}
        device={selectedDevice}
        onUpdate={handleUpdateDevice}
        onCancel={() => setIsEditOpen(false)}
      />

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
            <DeviceRow
              key={device.id}
              device={device}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              triggerDeletePrompt={triggerDeletePrompt}
              setIsEditOpen={setIsEditOpen}
              setSelectedDevice={setSelectedDevice}
            />
          ))}
        </tbody>
      </table>
      {toast.show && (
        <div className="toast-notification">
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{ marginRight: "10px" }}
          />
          {toast.message}
        </div>
      )}
    </div>
  );
}
export default DeviceTable;
