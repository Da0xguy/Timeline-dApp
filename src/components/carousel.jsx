import { useEffect, useState, useRef } from "react";
import "../App.css";

const STORAGE_KEY = "carouselImages";

function Carousel() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);

  const totalSlides = images.length;

  // 🧠 Load images from localStorage
  const loadImages = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setImages(parsed.map((img) => img.dataUrl));
    } catch (e) {
      console.error("Failed to load carousel images:", e);
    }
  };

  // 🔁 Load once on mount and listen for admin updates
  useEffect(() => {
    loadImages();
    const handleUpdate = () => loadImages();
    window.addEventListener("carousel-updated", handleUpdate);
    return () => window.removeEventListener("carousel-updated", handleUpdate);
  }, []);

  // ⏱️ Auto slide every 3 seconds
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  // 🌀 Smooth looping
  useEffect(() => {
    if (current === totalSlides) {
      const timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrent(0);
      }, 600);
      return () => clearTimeout(timeout);
    } else {
      setTransitionEnabled(true);
    }
  }, [current, totalSlides]);

  if (images.length === 0) {
    return (
      <div className="carousel-container empty">
        <p>No images uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div
        ref={trackRef}
        className="carousel-track"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: transitionEnabled ? "transform 0.6s ease-in-out" : "none",
        }}
      >
        {images.map((img, index) => (
          <div key={index} className="carousel-slide">
            <img src={img} alt={`Slide ${index}`} />
          </div>
        ))}
        {/* Clone first image for looping */}
        <div className="carousel-slide">
          <img src={images[0]} alt="clone" />
        </div>
      </div>
    </div>
  );
}

export default Carousel;
