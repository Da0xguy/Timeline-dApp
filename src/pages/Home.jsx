import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import Hero from "../assets/pic9.jpg";
import Mission from "../assets/mission.jpg";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // ✅ Supabase client

function Home() {
  const navigate = useNavigate();
  const heroImageRef = useRef(null);
  const storyImageRef = useRef(null);

  const [carouselImages, setCarouselImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // ✅ Load Carousel from Supabase
  async function loadCarousel() {
    const { data, error } = await supabase.storage.from("carousel").list("", { limit: 100 });
    if (error) {
      console.error("Carousel fetch error:", error);
      return;
    }
    const urls = data.map((file) =>
      supabase.storage.from("carousel").getPublicUrl(file.name).publicUrl
    );
    setCarouselImages(urls);
  }

  useEffect(() => {
    loadCarousel();
  }, []);

  // ⏱ Auto slide
  useEffect(() => {
    if (carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselImages]);

  // ✅ Intersection animations
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
            <button onClick={() => navigate("/products")} className="explore-btn">
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
      <div className="carousel-container">
        {carouselImages.length === 0 ? (
          <div className="carousel-empty">
            <p>No quotes uploaded yet.</p>
          </div>
        ) : (
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${current * 100}%)`,
              transition: transitionEnabled ? "transform 0.6s ease-in-out" : "none",
            }}
          >
            {carouselImages.map((img, index) => (
              <div key={index} className="carousel-slide">
                <img src={img} alt={`Slide ${index}`} />
              </div>
            ))}
            {carouselImages.length > 0 && (
              <div className="carousel-slide">
                <img src={carouselImages[0]} alt="clone" />
              </div>
            )}
          </div>
        )}
      </div>
      <footer className="footer">
        <p>&copy; 2025 Timeline — All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Home;
