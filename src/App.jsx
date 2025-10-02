import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import LoginPopup from "./components/LoginPopup";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="app">
      <Navbar setShowLogin={setShowLogin} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}

export default App;
