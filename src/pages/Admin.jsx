import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function AdminUploader() {
  const [carouselImages, setCarouselImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressProduct, setUploadProgressProduct] = useState(0);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    about: "",
    image: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Load all data (carousel + products)
  async function loadData() {
    console.log("🔄 Loading data from Supabase Storage...");

    // Load carousel images
    const { data: slides, error: slidesError } = await supabase.storage
      .from("carousel")
      .list("private", { limit: 100 });

    if (slidesError) console.error("❌ Carousel error:", slidesError);
    else console.log("✅ Carousel files:", slides);

    setCarouselImages(slides || []);

    // Load products (both images + JSON)
    const { data: productFiles, error: productsError } = await supabase.storage
      .from("products")
      .list("private", { limit: 100 });

    if (productsError) {
      console.error("❌ Products error:", productsError);
      return toast.error("Could not load products");
    }

    // Only get .json files (our metadata)
    const jsonFiles = productFiles.filter((file) => file.name.endsWith(".json"));

    // Fetch and parse metadata
    const productList = [];
    for (const file of jsonFiles) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from("products")
        .download(`private/${file.name}`);

      if (fileError) {
        console.error("❌ Failed to download JSON:", fileError);
        continue;
      }

      try {
        const text = await fileData.text();
        const product = JSON.parse(text);
        product._fileName = file.name; // store file name for deletion
        productList.push(product);
      } catch (err) {
        console.error("⚠️ Invalid JSON in file:", file.name);
      }
    }

    console.log("✅ Loaded products:", productList);
    setProducts(productList);
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    window.location.href = "/login";
  }

  // ✅ Upload helper
  async function uploadToSupabase(file, bucket, setProgress) {
    try {
      const safeName = file.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^\w.-]/g, "");

      const fileName = `${Date.now()}-${safeName}`;
      const filePath = `private/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(0);
      return publicUrlData?.publicUrl;
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error("Upload failed — check Supabase storage policies");
      setProgress(0);
      return null;
    }
  }

  // ✅ Upload carousel image
  async function handleCarouselUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadToSupabase(file, "carousel", setUploadProgress);
    if (!url) return;

    toast.success("Carousel image uploaded ✅");
    loadData();
  }

  // ✅ Delete carousel image
  async function removeCarouselImage(name) {
    const { error } = await supabase.storage
      .from("carousel")
      .remove([`private/${name}`]);

    if (error) toast.error("Failed to delete image");
    else {
      toast.success("Deleted");
      loadData();
    }
  }

  // ✅ Product image upload
  async function handleProductUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadToSupabase(file, "products", setUploadProgressProduct);
    if (!url) return;

    setProductForm((prev) => ({ ...prev, image: url }));
    toast.success("Product image uploaded ✅");
  }

  // ✅ Add product (stores .json file)
  async function addProduct() {
    const { name, price, about, image } = productForm;

    if (!name || !price || !about || !image)
      return toast.error("Fill in all fields and upload an image");

    try {
      const safeName = name.toLowerCase().replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
      const metadata = { name, price, about, image };

      const filePath = `private/${Date.now()}-${safeName}.json`;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, JSON.stringify(metadata), {
          contentType: "application/json",
          upsert: false,
        });

      if (error) throw error;

      toast.success("Product added ✅");
      setProductForm({ name: "", price: "", about: "", image: "" });
      loadData();
    } catch (err) {
      console.error("❌ Add product failed:", err);
      toast.error("Could not add product");
    }
  }

  // ✅ Delete product (by JSON filename)
  async function deleteProduct(fileName) {
    const { error } = await supabase.storage
      .from("products")
      .remove([`private/${fileName}`]);

    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted ✅");
      loadData();
    }
  }

  return (
    <div className="admin-tn">
      <h2>Admin Panel</h2>

      {/* ===== Carousel Section ===== */}
      <div className="admin-tn-uploader">
        <h3>Upload Carousel Image</h3>
        <input type="file" onChange={handleCarouselUpload} />
        {uploadProgress > 0 && <div className="note">Uploading: {uploadProgress}%</div>}

        <div className="admin-tn-preview-grid">
          {carouselImages.map((img) => {
            const { data } = supabase.storage
              .from("carousel")
              .getPublicUrl(`private/${img.name}`);
            return (
              <div className="admin-tn-preview-card" key={img.name}>
                <img src={data.publicUrl} alt="carousel" />
                <button onClick={() => removeCarouselImage(img.name)}>Delete</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Product Section ===== */}
      <div className="admin-tn-product-section">
        <h3>Add Product</h3>
        <input
          type="text"
          placeholder="Product Name"
          value={productForm.name}
          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Price"
          value={productForm.price}
          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
        />
        <textarea
          placeholder="About this product..."
          value={productForm.about}
          onChange={(e) => setProductForm({ ...productForm, about: e.target.value })}
        />
        <input type="file" onChange={handleProductUpload} />

        {uploadProgressProduct > 0 && (
          <div className="note">Uploading: {uploadProgressProduct}%</div>
        )}

        {productForm.image && (
          <img
            src={productForm.image}
            alt="preview"
            width="120"
            style={{ borderRadius: "6px", marginTop: "10px" }}
          />
        )}

        <button className="admin-tn-btn" onClick={addProduct}>
          Add Product
        </button>
      </div>

      {/* ===== Product List (from JSON) ===== */}
      <h3>All Products</h3>
      <div className="admin-tn-preview-grid">
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((p) => (
            <div className="admin-tn-preview-card" key={p._fileName}>
              <img src={p.image} alt={p.name} />
              <h4>{p.name}</h4>
              <p>₦{p.price}</p>
              <small>{p.about}</small>
              <button onClick={() => deleteProduct(p._fileName)}>Delete</button>
            </div>
          ))
        )}
      </div>

      <button className="admin-tn-logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
