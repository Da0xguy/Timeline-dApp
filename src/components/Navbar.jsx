import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import Logo from "../assets/logo.jpeg";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check Supabase auth
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    }
    getUser();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out ✅");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={Logo} alt="Timeline Logo" />
        <h1>TIMELINE</h1>
      </div>

      <div className="links">
        <ul>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>

        {user ? (
          <>
            <button onClick={() => navigate("/admin")}>Dashboard</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => navigate("/login")}>Admin Login</button>
        )}
      </div>

      {/* Hamburger menu for mobile */}
      <div className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <span></span><span></span><span></span>
      </div>
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li><NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/about" onClick={() => setIsMenuOpen(false)}>About</NavLink></li>
          <li><NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink></li>
          {user ? (
            <>
              <li onClick={() => { navigate("/admin"); setIsMenuOpen(false); }}>Dashboard</li>
              <li onClick={() => { handleLogout(); setIsMenuOpen(false); }}>Logout</li>
            </>
          ) : (
            <li onClick={() => { navigate("/login"); setIsMenuOpen(false); }}>Admin Login</li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
