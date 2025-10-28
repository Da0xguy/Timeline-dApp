import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Logo (top left for desktop) */}
      <div className="logo">
        <img src="/assets/logo.png" alt="Timeline Logo" />
        <h1>TIMELINE</h1>
      </div>

      {/* Desktop Navigation */}
      <div className="links">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <button className="admin-btn" onClick={() => navigate("/admin")}>
          Admin
        </button>
      </div>

      {/* Hamburger Menu (for mobile) */}
      <div
        className={`hamburger ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Mobile Sidebar (left side) */}
      <div className={`mobile-menu left ${isMenuOpen ? "open" : ""}`}>
        <div className="menu-content">
          <ul>
            <li onClick={() => { navigate("/"); setIsMenuOpen(false); }}>Home</li>
            <li onClick={() => { navigate("/about"); setIsMenuOpen(false); }}>About</li>
            <li onClick={() => { navigate("/contact"); setIsMenuOpen(false); }}>Contact</li>
            <li
              onClick={() => {
                navigate("/admin");
                setIsMenuOpen(false);
              }}
            >
              Admin
            </li>
          </ul>

          {/* Sidebar logo aligned to right */}
          <div className="sidebar-logo">
            <h1>TIMELINE</h1>
            <img src="/assets/logo.png" alt="Timeline Logo" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
