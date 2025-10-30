import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const STORAGE_KEY = "carouselImages";
const PRODUCT_KEY = "productList";

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

  // ✅ Load data from Firestore on mount
  useEffect(() => {
    loadCarouselImages();
    loadProducts();
  }, []);

  async function loadCarouselImages() {
    const snap = await getDocs(collection(db, "carousel"));
    setCarouselImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  // ✅ Upload Carousel Images
  async function handleCarouselUpload(e) {
    setError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const storageRef = ref(storage, `carousel/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, "carousel"), {
          url,
          name: file.name,
        });
      }

      loadCarouselImages();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try smaller images.");
    } finally {
      setBusy(false);
      e.target.value = null;
    }
  }

  // ✅ Delete Carousel Image
  async function removeCarouselImage(id) {
    await deleteDoc(doc(db, "carousel", id));
    loadCarouselImages();
  }

  // ✅ Clear All Carousel Images
  async function clearCarousel() {
    const snap = await getDocs(collection(db, "carousel"));
    for (const docu of snap.docs) {
      await deleteDoc(doc(db, "carousel", docu.id));
    }
    loadCarouselImages();
  }

  // ✅ Form Change
  function handleProductChange(e) {
    setProductForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ✅ Upload Product Image
  async function handleProductImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setProductForm((prev) => ({ ...prev, image: url }));
  }

  // ✅ Add Product
  async function addProduct() {
    if (!productForm.name || !productForm.price || !productForm.image) {
      setError("Please fill all fields and upload an image.");
      return;
    }

    await addDoc(collection(db, "products"), productForm);

    setProductForm({ name: "", price: "", about: "", image: "" });
    loadProducts();
  }

  // ✅ Delete Product
  async function deleteProduct(id) {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
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
          Images are uploaded to <code>Firebase</code>.
        </small>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="admin-actions">
        <button onClick={clearCarousel} disabled={carouselImages.length === 0}>
          Clear all slides
        </button>
      </div>

      {/* ✅ YOUR ORIGINAL PREVIEW GRID */}
      <div className="preview-grid">
        {carouselImages.length === 0 && (
          <div className="note">No slides yet</div>
        )}

        {carouselImages.map((img) => (
          <div className="preview-card" key={img.id}>
            <img src={img.url} alt={img.name} />
            <div className="meta">
              <div className="name">{img.name}</div>
              <button onClick={() => removeCarouselImage(img.id)}>
                Delete
              </button>
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
          placeholder="Price"
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

      {/* ✅ Original Product Preview */}
      <div className="preview-grid">
        {products.length === 0 && (
          <div className="note">No products added yet</div>
        )}

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
