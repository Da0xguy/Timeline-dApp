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

  // ✅ Load data from storage
  async function loadData() {
    console.log("🔄 Loading data from Supabase Storage...");

    // Carousel images
    const { data: slides, error: slidesError } = await supabase.storage
      .from("carousel")
      .list("private", { limit: 100 });

    if (slidesError) console.error("❌ Carousel error:", slidesError);
    else console.log("✅ Carousel files:", slides);

    setCarouselImages(slides || []);

    // Product images
    const { data: productFiles, error: productsError } = await supabase.storage
      .from("products")
      .list("private", { limit: 100 });

    if (productsError) console.error("❌ Products error:", productsError);
    else console.log("✅ Product files:", productFiles);

    setProducts(productFiles || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    window.location.href = "/login";
  }

  // ✅ Reusable upload helper
  async function uploadToSupabase(file, bucket, setProgress) {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `private/${fileName}`;

      console.log(`📤 Uploading to ${bucket}/${filePath}`);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log("📦 Uploaded:", data);
      console.log("🌐 URL:", publicUrlData);

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

    if (error) {
      console.error("❌ Delete error:", error);
      toast.error("Failed to delete image");
    } else {
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

  // ✅ Add product — now stored as image with metadata JSON
  async function addProduct() {
    const { name, price, about, image } = productForm;

    if (!name || !price || !about || !image)
      return toast.error("Fill in all fields and upload an image");

    try {
      // Save metadata as a .json file alongside image
      const metadata = { name, price, about, image };
      const filePath = `private/${Date.now()}-${name.replace(/\s+/g, "_")}.json`;

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

  // ✅ Delete product (image + JSON)
  async function deleteProduct(name) {
    const { error } = await supabase.storage
      .from("products")
      .remove([`private/${name}`]);

    if (error) {
      console.error("❌ Delete failed:", error);
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

      {/* ===== Product List ===== */}
      <div className="admin-tn-preview-grid">
        {products.map((p) => {
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(`private/${p.name}`);
          return (
            <div className="admin-tn-preview-card" key={p.name}>
              <img src={data.publicUrl} alt={p.name} />
              <div>{p.name}</div>
              <button onClick={() => deleteProduct(p.name)}>Delete</button>
            </div>
          );
        })}
      </div>

      <button className="admin-tn-logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
