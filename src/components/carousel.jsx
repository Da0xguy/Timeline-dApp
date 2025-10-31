import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase"; // ✅ Use your shared Supabase client
import "../App.css";

function Carousel() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);

  const totalSlides = images.length;

  // 🧠 Load images from Supabase Storage (carousel/private/)
  const loadImages = async () => {
    console.log("🔄 Fetching carousel images...");

    try {
      // ✅ Only list from the private folder
      const { data, error } = await supabase.storage
        .from("carousel")
        .list("private", { limit: 100 });

      if (error) {
        console.error("❌ Error fetching carousel images:", error);
        return;
      }

      // ✅ Filter out non-image files
      const imageFiles = data.filter(
        (file) =>
          file.name.endsWith(".jpg") ||
          file.name.endsWith(".jpeg") ||
          file.name.endsWith(".png") ||
          file.name.endsWith(".webp")
      );

      console.log("📸 Found image files:", imageFiles);

      // ✅ Generate public URLs for each image
      const urls = imageFiles.map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from("carousel")
          .getPublicUrl(`private/${file.name}`);
        return publicUrlData.publicUrl;
      });

      setImages(urls);
      console.log("✅ Carousel images loaded:", urls);
    } catch (e) {
      console.error("🚨 Failed to load carousel images:", e);
    }
  };

  // 🔁 Load once on mount
  useEffect(() => {
    loadImages();
  }, []);

  // ⏱️ Auto-slide every 3 seconds
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
      }, 600);
      return () => clearTimeout(timeout);
    } else {
      setTransitionEnabled(true);
    }
  }, [current, totalSlides]);

  // 💨 If empty
  if (images.length === 0) {
    return (
      <div className="carousel-container empty">
        <p>No carousel images found.</p>
      </div>
    );
  }

  // 🖼️ Render
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
            <img src={img} alt={`Slide ${index + 1}`} />
          </div>
        ))}

        {/* Clone first image for smooth looping */}
        <div className="carousel-slide">
          <img src={images[0]} alt="clone" />
        </div>
      </div>
    </div>
  );
}

export default Carousel;
