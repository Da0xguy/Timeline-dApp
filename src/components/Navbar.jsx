import React, { useState } from "react";
import "../App.css";

function Navbar({ setShowLogin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false); // close sidebar when a link is clicked
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/assets/logo.png" alt="Timeline Logo" />
        <h1>TIMELINE</h1>
      </div>

      {/* Desktop Links */}
      <div className="links">
        <ul>
          <li onClick={() => scrollToSection("home")}>Home</li>
          <li onClick={() => scrollToSection("about")}>About</li>
          <li onClick={() => scrollToSection("contact")}>Contact</li>
        </ul>
        <button className="admin-btn" onClick={() => setShowLogin(true)}>
          Admin
        </button>
      </div>

      {/* Hamburger Icon */}
      <div
        className={`hamburger ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar Menu */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li onClick={() => scrollToSection("home")}>Home</li>
          <li onClick={() => scrollToSection("about")}>About</li>
          <li onClick={() => scrollToSection("contact")}>Contact</li>
          <li onClick={() => { setShowLogin(true); setIsMenuOpen(false); }}>
            Admin
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
