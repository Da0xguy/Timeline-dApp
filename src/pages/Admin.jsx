import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

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
    path: "",
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

  // ✅ Upload Carousel Images + Save Storage Path
  async function handleCarouselUpload(e) {
    setError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const filePath = `carousel/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, filePath);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, "carousel"), {
          url,
          name: file.name,
          path: filePath, // ✅ stored for deletion
        });
      }
      loadCarouselImages();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try again.");
    } finally {
      setBusy(false);
      e.target.value = null;
    }
  }

  // ✅ Delete Carousel Image + Firebase Storage file
  async function removeCarouselImage(id, path) {
    try {
      await deleteObject(ref(storage, path));
      await deleteDoc(doc(db, "carousel", id));
      loadCarouselImages();
    } catch (err) {
      console.error(err);
      alert("Error deleting file");
    }
  }

  async function clearCarousel() {
    const snap = await getDocs(collection(db, "carousel"));
    for (const d of snap.docs) {
      if (d.data().path) await deleteObject(ref(storage, d.data().path));
      await deleteDoc(doc(db, "carousel", d.id));
    }
    loadCarouselImages();
  }

  // ✅ Product Input
  function handleProductChange(e) {
    setProductForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ✅ Upload Product Image + Save Path
  async function handleProductImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `products/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setProductForm(prev => ({
      ...prev,
      image: url,
      path: filePath, // ✅ Save delete path
    }));
  }

  // ✅ Add Product
  async function addProduct() {
    if (!productForm.name || !productForm.price || !productForm.image) {
      setError("Please fill all fields & upload an image.");
      return;
    }

    await addDoc(collection(db, "products"), productForm);
    setProductForm({ name: "", price: "", about: "", image: "", path: "" });
    loadProducts();
  }

  // ✅ Delete Product + Storage File
  async function deleteProduct(id, path) {
    try {
      await deleteObject(ref(storage, path));
      await deleteDoc(doc(db, "products", id));
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  }

  return (
    <div className="admin">
      <h2>Admin Panel</h2>

      {/* 🔹 Carousel Upload */}
      <div className="uploader">
        <h3>Carousel Image Upload</h3>
        <input type="file" accept="image/*" multiple onChange={handleCarouselUpload} disabled={busy}/>
        {error && <div className="error">{error}</div>}
      </div>

      <button onClick={clearCarousel} disabled={!carouselImages.length}>
        Clear all slides
      </button>

      <div className="preview-grid">
        {carouselImages.map(img => (
          <div className="preview-card" key={img.id}>
            <img src={img.url} alt={img.name}/>
            <div className="meta">
              <div className="name">{img.name}</div>
              <button onClick={() => removeCarouselImage(img.id, img.path)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <hr />

      {/* 🔹 Product Upload */}
      <div className="product-section">
        <h3>Add Product</h3>

        <input name="name" placeholder="Name" value={productForm.name} onChange={handleProductChange} />
        <input name="price" placeholder="Price" value={productForm.price} onChange={handleProductChange} />
        <textarea name="about" placeholder="About" value={productForm.about} onChange={handleProductChange} />

        <input type="file" accept="image/*" onChange={handleProductImage} />

        {productForm.image && <img src={productForm.image} width="120"/>}

        <button onClick={addProduct}>Add Product</button>
      </div>

      <div className="preview-grid">
        {products.map(p => (
          <div className="preview-card" key={p.id}>
            <img src={p.image} alt={p.name}/>
            <div className="meta">
              <div className="name">{p.name}</div>
              <div className="price">{p.price}</div>
              <div className="desc">{p.about}</div>
              <button onClick={() => deleteProduct(p.id, p.path)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
