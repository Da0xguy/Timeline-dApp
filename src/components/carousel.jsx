import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import "../App.css";

function Carousel() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);

  const totalSlides = images.length;

  // Load images from bucket
  const loadImages = async () => {
    console.log("🔄 Fetching carousel images...");

    try {
      // Change 'public' to 'private' if using private folder
      const folder = "public"; 
      const { data: files, error } = await supabase.storage
        .from("carousel")
        .list(folder, { limit: 100 });

      if (error) {
        console.error("❌ Error fetching carousel images:", error);
        return;
      }

      const imageFiles = files.filter(file =>
        [".jpg", ".jpeg", ".png", ".webp"].some(ext => file.name.endsWith(ext))
      );

      console.log("📸 Found image files:", imageFiles);

      const urls = await Promise.all(
        imageFiles.map(async (file) => {
          if (folder === "public") {
            const { data: publicUrlData } = supabase.storage
              .from("carousel")
              .getPublicUrl(`${folder}/${file.name}`);
            return publicUrlData.publicUrl;
          } else {
            const { data: signedData, error } = await supabase.storage
              .from("carousel")
              .createSignedUrl(`${folder}/${file.name}`, 60); // expires in 60s
            if (error) return null;
            return signedData.signedUrl;
          }
        })
      );

      const validUrls = urls.filter(Boolean);
      setImages(validUrls);
      console.log("✅ Carousel images loaded:", validUrls);

    } catch (e) {
      console.error("🚨 Failed to load carousel images:", e);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => setCurrent(prev => prev + 1), 3000);
    return () => clearInterval(interval);
  }, [images]);

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
    return <div className="carousel-container empty"><p>No carousel images found.</p></div>;
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
