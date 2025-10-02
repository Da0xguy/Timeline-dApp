import React, { useEffect, useRef, useState } from "react";
import "../App.css";

const STORAGE_KEY = "carouselImages";

export default function Carousel({ autoPlayMs = 3000 }) {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    loadSlides();

    // Listen for changes from admin (other tabs or same page)
    function onStorage(e) {
      if (e.key === STORAGE_KEY) loadSlides();
    }
    function onCustom() {
      loadSlides();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("carousel-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("carousel-updated", onCustom);
    };
  }, []);

  function loadSlides() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      setSlides(arr);
      setIndex(0);
    } catch (e) {
      console.error(e);
      setSlides([]);
    }
  }

  // autoplay
  useEffect(() => {
    clearInterval(timerRef.current);
    if (slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % slides.length);
    }, autoPlayMs);
    return () => clearInterval(timerRef.current);
  }, [slides, autoPlayMs]);

  function goTo(i) {
    setIndex(i % slides.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }
  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  if (!slides || slides.length === 0) {
    return <div className="carousel empty">No slides — add some in Admin</div>;
  }

  return (
    <div
      className="carousel"
      ref={containerRef}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      <div
        className="carousel-inner"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div className="carousel-item" key={s.id}>
            <img src={s.dataUrl} alt={s.name || "slide"} />
          </div>
        ))}
      </div>

      {/* controls */}
      <button className="carousel-btn prev" onClick={prev} aria-label="Previous">
        ‹
      </button>
      <button className="carousel-btn next" onClick={next} aria-label="Next">
        ›
      </button>

      {/* dots */}
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
