import React, { useEffect, useRef } from "react";
import "../App.css";
import Hero from "../assets/pic9.jpg";
import Mission from "../assets/mission.jpg";
import { useNavigate } from "react-router-dom";
import Carousel from "../components/carousel";

function Home() {
  const navigate = useNavigate();
  const heroImageRef = useRef(null);
  const storyImageRef = useRef(null);

  useEffect(() => {
    const elements = [heroImageRef.current, storyImageRef.current];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("active", entry.isIntersecting);
      });
    });

    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 🏠 Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div>
            <h1>
              TIMELINE,<br />
              <span>Your Clothing Brand</span>
            </h1>
            <p>
              Elevate your style with TIMELINE! Get exclusive updates on our
              latest T-shirt designs and promotions.
            </p>
            <button onClick={() => navigate("/dashboard")} className="explore-btn">
              Explore Items
            </button>
          </div>
        </div>

        <div className="hero-image">
          <img ref={heroImageRef} src={Hero} alt="Hero" />
        </div>
      </section>

      {/* 🧵 About / Mission Section */}
      <section className="story" id="about">
        <div className="story-img">
          <img ref={storyImageRef} src={Mission} alt="Mission" />
        </div>

        <div className="story-text">
          <h2>Wear the Story</h2>
          <p>
            <b>Timeline</b> is where faith meets fashion — every piece carries a message
            of purpose, hope, and God’s love.
          </p>

          <h4>What to Expect:</h4>
          <ul>
            <li>Design sneak peeks</li>
            <li>Devotional-style messages</li>
            <li>Behind-the-scenes creativity</li>
            <li>Faith and purpose stories</li>
            <li>Early access drops</li>
            <li>Exclusive promo codes</li>
          </ul>
        </div>
      </section>

      {/* 🖼️ Carousel Section */}
      <section className="carousel-section">
        <Carousel />
      </section>

      {/* ⚡ Footer */}
      <footer className="footer">
        <p>&copy; 2025 Timeline — All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Home;
