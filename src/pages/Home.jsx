import React, { useEffect, useRef } from "react";
import "../App.css";
import Hero from "../assets/pic9.jpg"
import Mission from "../assets/mission.jpg"
import Carousel from "../components/carousel";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const heroImageRef = useRef(null);
  const storyImageRef = useRef(null);

  useEffect(() => {
    const images = [heroImageRef.current, storyImageRef.current];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    });

    images.forEach((img) => {
      if (img) observer.observe(img);
    });

    return () => observer.disconnect();
  }, []);


  return (
    <>
      <section className="hero" id="home">
        <div className="hero-content">
          <div>
            <h1>
              TIMELINE,<br />
              <span>Your Clothing Brand</span>
            </h1>
            <p>
              Elevate your style with TIMELINE! Get exclusive updates on our
              latest T-shirt designs, behind-the-scenes peeks, and special
              promotions.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="explore-btn"
            >
              Explore Items
            </button>
          </div>
        </div>

        <div className="hero-image">
          <img ref={heroImageRef} src={Hero} alt="Hero" />
        </div>
      </section>

      <section className="story" id="about">
        <div className="story-img">
          <img ref={storyImageRef} src={Mission} alt="Mission" />
        </div>

        <div className="story-text">
          <h2>Wear the Story</h2>
          <p>
            This is more than a clothing brand. <b>Timeline</b> is a movement —
            where fashion meets faith, and walking with God becomes something you
            can literally wear. Every design tells a part of <b>His story</b> —
            from creation to the cross, from the empty grave to your calling.
          </p>

          <h4>What to Expect Here:</h4>
          <ul>
            <li>Sneak Peeks of upcoming designs</li>
            <li>Devotional-style design breakdowns</li>
            <li>Behind-the-scenes of the brand</li>
            <li>Real conversations about faith + purpose</li>
            <li>Early access to launches</li>
            <li>Promo codes</li>
            <li>Self development and growth</li>
          </ul>
        </div>
      </section>

      <div className="quotes-section">
        <Carousel />
      </div>

      <footer className="footer">
        <p>&copy; 2025 Timeline — All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Home;
