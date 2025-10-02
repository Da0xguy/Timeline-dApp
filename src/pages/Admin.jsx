import React, { useEffect, useState } from "react";

const STORAGE_KEY = "carouselImages";

/**
 * Convert a File to a compressed Data URL (JPEG). Reduces size.
 * maxWidth - resize width if image is larger, preserving aspect ratio.
 * quality - 0..1 for jpeg quality
 */
async function fileToDataUrl(file, maxWidth = 1200, quality = 0.8) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });

  // If file is small, keep it as-is
  if (!dataUrl.startsWith("data:image/")) return dataUrl;

  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl); // fallback to original if load fails
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      // white background for JPEG (avoids transparent black)
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // convert to jpeg to reduce size. If you need transparency, use png, but larger.
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.src = dataUrl;
  });
}

export default function AdminUploader() {
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadImages();
  }, []);

  function loadImages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setImages(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error(e);
      setImages([]);
    }
  }

  async function handleFiles(e) {
    setError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const processed = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        // you can tweak maxWidth and quality
        const dataUrl = await fileToDataUrl(file, 1200, 0.78);
        processed.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          dataUrl,
        });
      }
      const newImgs = [...images, ...processed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newImgs));
      setImages(newImgs);

      // notify other tabs (storage event won't fire in same tab)
      window.dispatchEvent(new Event("carousel-updated"));
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try smaller images or fewer files.");
    } finally {
      setBusy(false);
      e.target.value = null; // reset file input
    }
  }

  function removeImage(id) {
    const newImgs = images.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newImgs));
    setImages(newImgs);
    window.dispatchEvent(new Event("carousel-updated"));
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    setImages([]);
    window.dispatchEvent(new Event("carousel-updated"));
  }

  return (
    <div className="admin">
      <h2>Admin — Upload carousel slides</h2>

      <div className="uploader">
        <input
          id="file"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={busy}
        />
        <small>
          Images are compressed and saved to <code>localStorage</code>. Keep a
          few small images (recommended).
        </small>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="admin-actions">
        <button onClick={clearAll} disabled={images.length === 0}>
          Clear all slides
        </button>
      </div>

      <div className="preview-grid">
        {images.length === 0 && <div className="note">No slides yet</div>}
        {images.map((img) => (
          <div className="preview-card" key={img.id}>
            <img src={img.dataUrl} alt={img.name || "slide"} />
            <div className="meta">
              <div className="name">{img.name}</div>
              <button onClick={() => removeImage(img.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
