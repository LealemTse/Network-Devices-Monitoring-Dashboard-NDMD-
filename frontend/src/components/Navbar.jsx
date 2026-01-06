import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

// Reusing your existing ConfirmModal component logic
const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Logout Confirmation</h3>
        <br></br>
        <p>Are you sure you want to log out of the dashboard?</p>
        <br></br>
        <div className="modal-actions">
          <button className="confirm-btn" onClick={onCancel}>
            Stay Logged In
          </button>
          <button className="cancel-btn" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [showModal, setShowModal] = useState(false); // Logout modal state
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    setShowModal(false); // Close modal
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">NDMD</h2>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showModal}
        onConfirm={handleLogout}
        onCancel={() => setShowModal(false)}
      />

      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>

      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li className="link" onClick={() => setIsOpen(false)}>
          <NavLink to="/">Dashboard</NavLink>
        </li>
        <li className="link" onClick={() => setIsOpen(false)}>
          <NavLink to="/Logs">Logs</NavLink>
        </li>
        <li className="link" onClick={() => setIsOpen(false)}>
          <NavLink to="/settings">Settings</NavLink>
        </li>
        <li className="link" onClick={() => setIsOpen(false)}>
          <NavLink to="/help">Help</NavLink>
        </li>
        <li className="mobile-only">
          {/* Mobile Logout trigger */}
          <button className="logout" onClick={() => setShowModal(true)}>
            Logout
          </button>
        </li>
      </ul>

      {/* Desktop Logout trigger */}
      <button
        className="logout desktop-only"
        onClick={() => setShowModal(true)}
      >
        Logout
      </button>
    </nav>
  );
}
