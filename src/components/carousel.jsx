import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "../App.css";

// 🔑 Supabase credentials
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function Carousel() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);

  const totalSlides = images.length;

  // 🧠 Load images from Supabase Storage
  const loadImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("carousel") // your bucket name
        .list("", { limit: 100, offset: 0 });

      if (error) throw error;

      // Convert paths to public URLs
      const urls = data.map((file) =>
        supabase.storage.from("carousel").getPublicUrl(file.name).publicUrl
      );

      setImages(urls);
    } catch (e) {
      console.error("Failed to load carousel images:", e);
    }
  };

  // 🔁 Load once on mount
  useEffect(() => {
    loadImages();
  }, []);

  // ⏱️ Auto slide every 3s
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  // 🌀 Infinite loop logic
  useEffect(() => {
    if (current === totalSlides) {
      const timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrent(0);
      }, 600); // match transition duration
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
