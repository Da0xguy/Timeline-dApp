import React from "react";
import "../App.css";

function LoginPopup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>Admin Login</h2>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <div className="popup-actions">
          <button onClick={onClose}>Cancel</button>
          <button>Login</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPopup;
