import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../App.css";
import LoginPopup from "./LoginPopup";
import Logo from "../assets/logo.jpeg"

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="navbar">
        {/* Logo section */}
        <div className="logo">
          <img src={Logo} alt="Timeline Logo" />
          <h1>TIMELINE</h1>
        </div>

        <div className="links">
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
          </ul>
          <button className="admin-btn" onClick={() => setShowLogin(true)}>
            Admin
          </button>
        </div>

        {/* Hamburger icon for mobile */}
        <div
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Mobile sidebar menu (slides in from left) */}
        <div className={`mobile-menu left ${isMenuOpen ? "open" : ""}`}>
          <div className="menu-content">
            <ul>
              <li>
                <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>
                  About
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </NavLink>
              </li>
              <li
                onClick={() => {
                  setShowLogin(true);
                  setIsMenuOpen(false);
                }}
              >
                Admin
              </li>
            </ul>

            {/* Sidebar logo (aligned to the right) */}
            <div className="sidebar-logo">
              <h1>TIMELINE</h1>
              <img src={Logo} alt="Timeline Logo" />
            </div>
          </div>
        </div>
      </nav>

      {/* Admin login popup */}
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default Navbar;
