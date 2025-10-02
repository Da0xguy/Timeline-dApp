import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Navbar({ setShowLogin }) {
  return (
    <nav className="navbar">
      <h1 className="logo">TIMELINE</h1>
      <div className="links">
        <ul>
        <li smooth={true} duration={500} spy={true} onClick={() => scrollToSection("home")}>Home</li>
        <li smooth={true} duration={500} spy={true} onClick={() => scrollToSection("about")}>About</li>
        <li smooth={true} duration={500} spy={true} onClick={() => scrollToSection("contact")}>Contact</li>
        </ul>
        <button className="admin-btn" onClick={() => setShowLogin(true)}>
          Admin
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
