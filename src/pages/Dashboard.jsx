import React, { useEffect, useState } from "react";
import "../App.css";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }

    setProducts(data || []);
  }

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setShowOrderForm(true);
  };

  const WHATSAPP_NUMBER = "2348105385548"; // change to yours

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

      <div className="product-grid">
        {products.length === 0 && <div className="note">No products yet.</div>}

        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              <img src={product.image_url} alt={product.name} />
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <p className="price">₦{product.price}</p>
              <p className="about">{product.about}</p>
              <button className="order-btn" onClick={() => handleOrderClick(product)}>
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>

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
                  onClick={() => setShowOrderForm(false)}
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
