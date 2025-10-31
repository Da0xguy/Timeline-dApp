import React, { useEffect, useState } from "react";
import "../App.css";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  // ✅ Load products from Supabase Storage (products/private/)
  async function loadProducts() {
    console.log("🔄 Fetching products...");
    setLoading(true);

    const { data, error } = await supabase.storage
      .from("products")
      .list("private", { limit: 100 });

    if (error) {
      console.error("❌ Error fetching product list:", error);
      setLoading(false);
      return;
    }

    const jsonFiles = data.filter((file) => file.name.endsWith(".json"));
    console.log("📁 Found JSON files:", jsonFiles);

    const productsWithMeta = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = `private/${file.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from("products")
          .download(filePath);

        if (fileError) {
          console.error(`⚠️ Error downloading ${file.name}:`, fileError);
          return null;
        }

        try {
          const text = await fileData.text();
          const product = JSON.parse(text);

          // ✅ If image is already a full URL, use it directly
          if (product.image?.startsWith("https://")) {
            product.image_url = product.image;
          } else {
            // Otherwise, generate a public URL from Supabase
            const imageName = product.image.split("/").pop();
            const { data: publicUrlData } = supabase.storage
              .from("products")
              .getPublicUrl(`private/${imageName}`);
            product.image_url = publicUrlData.publicUrl;
          }

          return product;
        } catch (err) {
          console.error("⚠️ Invalid JSON in file:", file.name);
          return null;
        }
      })
    );

    const validProducts = productsWithMeta.filter(Boolean);
    setProducts(validProducts);
    console.log("✅ Products loaded:", validProducts);
    setLoading(false);
  }

  const WHATSAPP_NUMBER = "2348105385548"; // change to yours

  // 🛍️ Open modal for product details
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  // 🧾 Handle order submission
  const handleSubmitOrder = (e) => {
    e.preventDefault();

    const message = `
📦 *NEW ORDER*
-------------------------
🛍️ *Product:* ${selectedProduct.name}
💵 *Price:* ₦${selectedProduct.price}

👤 *Name:* ${formData.name}
🏠 *Address:* ${formData.address}
📞 *Phone:* ${formData.phone}
    `;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setShowOrderForm(false);
    setFormData({ name: "", address: "", phone: "" });
  };

  return (
    <div className="dashboard">
      <h2>🛍️ Product Dashboard</h2>
      <p>All products uploaded by the admin are displayed below.</p>

      {loading ? (
        <div className="note">⏳ Fetching products...</div>
      ) : (
        <div className="product-grid">
          {products.length === 0 && <div className="note">No products yet.</div>}

          {products.map((product, index) => (
            <div className="product-card" key={index}>
              <div className="product-image">
                <img src={product.image_url} alt={product.name} />
              </div>
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="price">₦{product.price}</p>
                <button className="details-btn" onClick={() => handleViewDetails(product)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🪟 Product Details Modal */}
      {selectedProduct && !showOrderForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>
              ✕
            </button>
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="modal-image"
            />
            <h2>{selectedProduct.name}</h2>
            <p className="modal-price">₦{selectedProduct.price}</p>
            <p className="modal-about">{selectedProduct.about}</p>
            <button className="order-btn" onClick={() => setShowOrderForm(true)}>
              Order Now
            </button>
          </div>
        </div>
      )}

      {/* 🧾 Order Form Modal */}
      {showOrderForm && (
        <div className="order-overlay">
          <div className="order-popup">
            <h3>Order: {selectedProduct?.name}</h3>

            <form onSubmit={handleSubmitOrder}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Delivery Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              <div className="order-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderForm(false);
                    setSelectedProduct(null);
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
