import React from "react";
import "../App.css";
import Carousel from "../components/carousel";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const uploadedImages = [
    "src/assets/pic1.jpg",
    "src/assets/pic2.jpg",
    "src/assets/pic3.jpg",
    "src/assets/pic4.jpg",
    "src/assets/pic5.jpg",
    "src/assets/pic6.jpg",
    "src/assets/pic7.jpg",
    "src/assets/pic8.jpg",
  ];

  return (
    <>
      <section className="hero" id="home">
        <h1>
          TIMELINE,<br />
          <span>Your Clothing Brand</span>
        </h1>

        <p>
          Elevate your style with TIMELINE! Get exclusive updates on our latest
          T-shirt designs, behind-the-scenes peeks, and special promotions.
        </p>

        <button
          onClick={() => navigate("/products")}
          className="explore-btn"
        >
          Explore Items
        </button>
      </section>

      <section className="story" id="about">
        <h2>Wear the Story</h2>
        <p>
          This is more than a clothing brand. <b>Timeline</b> is a movement —
          where fashion meets faith, and walking with God becomes something you
          can literally wear. Every design tells a part of <b>His story</b> —
          from creation to the cross, from the empty grave to your calling.
          We're here to help you express your faith with boldness and creativity.
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

        <div className="quotes-section">
          <h2>Quotes</h2>
          <Carousel images={uploadedImages} />
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Timeline — All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Home;
