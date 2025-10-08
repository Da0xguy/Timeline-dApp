import React, { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

function LoginPopup({ onClose }) {
    const navigate = useNavigate();
    const [Username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();

      if (username === "admin" && password === "1234") {
        navigate("/admin");
      } else {
        setError("Invali Username or password");
      }
    };
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username"
        value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password"
        value={password} onChange={(e) => setUsername(e.target.value)} />
        <div className="popup-actions">
          <button onClick={onClose}>Cancel</button>
          <button>Login</button>
        </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPopup;
