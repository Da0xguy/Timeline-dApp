import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import LoginPopup from "./components/LoginPopup";
import Dashboard from "./pages/Dashboard";


function ErrorBoundary({ children }) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {children}
    </React.Suspense>
  );
}

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
        <Route path="/products" element={<Dashboard />} />

      </Routes>

      {showLogin && (
        <ErrorBoundary>
          <LoginPopup onClose={() => setShowLogin(false)} />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
