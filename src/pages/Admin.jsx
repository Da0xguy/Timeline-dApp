import React, { useEffect, useState } from "react";

const STORAGE_KEY = "carouselImages";
const PRODUCT_KEY = "productList";

// Utility: compress image
async function fileToDataUrl(file, maxWidth = 1200, quality = 0.8) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });

  if (!dataUrl.startsWith("data:image/")) return dataUrl;

  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function AdminUploader() {
  const [carouselImages, setCarouselImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    about: "",
    image: "",
  });

  useEffect(() => {
    loadCarouselImages();
    loadProducts();
  }, []);

  function loadCarouselImages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setCarouselImages(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error(e);
      setCarouselImages([]);
    }
  }

  function loadProducts() {
    try {
      const raw = localStorage.getItem(PRODUCT_KEY);
      setProducts(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  }

  // 🖼️ Handle Carousel Upload
  async function handleCarouselUpload(e) {
    setError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const processed = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await fileToDataUrl(file, 1200, 0.78);
        processed.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          dataUrl,
        });
      }
      const newImgs = [...carouselImages, ...processed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newImgs));
      setCarouselImages(newImgs);
      window.dispatchEvent(new Event("carousel-updated"));
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try smaller images or fewer files.");
    } finally {
      setBusy(false);
      e.target.value = null;
    }
  }

  // 🗑️ Remove Carousel Image
  function removeCarouselImage(id) {
    const newImgs = carouselImages.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newImgs));
    setCarouselImages(newImgs);
    window.dispatchEvent(new Event("carousel-updated"));
  }

  // 🧹 Clear All Carousel
  function clearCarousel() {
    localStorage.removeItem(STORAGE_KEY);
    setCarouselImages([]);
    window.dispatchEvent(new Event("carousel-updated"));
  }

  // 🛒 Handle Product Input Change
  function handleProductChange(e) {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  }

  // 🖼️ Handle Product Image Upload
  async function handleProductImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file, 800, 0.8);
    setProductForm((prev) => ({ ...prev, image: dataUrl }));
  }

  // 💾 Add Product
  function addProduct() {
    if (!productForm.name || !productForm.price || !productForm.image) {
      setError("Please fill all fields and upload an image.");
      return;
    }
    const newProduct = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      ...productForm,
    };
    const updated = [...products, newProduct];
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(updated));
    setProducts(updated);
    setProductForm({ name: "", price: "", about: "", image: "" });
  }

  // ❌ Delete Product
  function deleteProduct(id) {
    const updated = products.filter((p) => p.id !== id);
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(updated));
    setProducts(updated);
  }

  return (
    <div className="admin">
      <h2>Admin Panel</h2>

      {/* 🔹 Carousel Upload Section */}
      <div className="uploader">
        <h3>Carousel Image Upload</h3>
        <input
          id="file"
          type="file"
          accept="image/*"
          multiple
          onChange={handleCarouselUpload}
          disabled={busy}
        />
        <small>
          Images are compressed and saved to <code>localStorage</code>.
        </small>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="admin-actions">
        <button onClick={clearCarousel} disabled={carouselImages.length === 0}>
          Clear all slides
        </button>
      </div>

      <div className="preview-grid">
        {carouselImages.length === 0 && <div className="note">No slides yet</div>}
        {carouselImages.map((img) => (
          <div className="preview-card" key={img.id}>
            <img src={img.dataUrl} alt={img.name || "slide"} />
            <div className="meta">
              <div className="name">{img.name}</div>
              <button onClick={() => removeCarouselImage(img.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <hr style={{ margin: "30px 0", borderColor: "red" }} />

      {/* 🔹 Product Upload Section */}
      <div className="product-section">
        <h3>Product Upload</h3>
        <input
          type="text"
          name="name"
          placeholder="Product name"
          value={productForm.name}
          onChange={handleProductChange}
        />
        <input
          type="text"
          name="price"
          placeholder="Price (e.g. $25)"
          value={productForm.price}
          onChange={handleProductChange}
        />
        <textarea
          name="about"
          placeholder="About product"
          value={productForm.about}
          onChange={handleProductChange}
        />
        <input type="file" accept="image/*" onChange={handleProductImage} />

        {productForm.image && (
          <div className="preview-card">
            <img src={productForm.image} alt="preview" />
          </div>
        )}

        <button className="admin-btn" onClick={addProduct}>
          Add Product
        </button>
      </div>

      <div className="preview-grid">
        {products.length === 0 && <div className="note">No products added yet</div>}
        {products.map((p) => (
          <div className="preview-card" key={p.id}>
            <img src={p.image} alt={p.name} />
            <div className="meta">
              <div className="name">{p.name}</div>
              <div className="price">{p.price}</div>
              <div className="desc">{p.about}</div>
              <button onClick={() => deleteProduct(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
