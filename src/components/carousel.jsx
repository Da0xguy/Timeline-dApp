import { useEffect, useState, useRef } from "react";
import "../App.css";

function Carousel({ images }) {
  const [current, setCurrent] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);

  const totalSlides = images.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 3000); // every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (current === totalSlides) {
      // After transition ends, reset instantly to first real slide
      const timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrent(0);
      }, 600); // match transition duration
      return () => clearTimeout(timeout);
    } else {
      setTransitionEnabled(true);
    }
  }, [current, totalSlides]);

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
        {/* Clone first image at the end */}
        <div className="carousel-slide">
          <img src={images[0]} alt="clone" />
        </div>
      </div>
    </div>
  );
}

export default Carousel;
