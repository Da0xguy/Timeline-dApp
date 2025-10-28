import React, { useEffect, useState } from "react";
import "../App.css";

const PRODUCT_KEY = "productList";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });

  useEffect(() => {
    loadProducts();

    const updateListener = () => loadProducts();
    window.addEventListener("storage", updateListener);
    window.addEventListener("product-updated", updateListener);
    return () => {
      window.removeEventListener("storage", updateListener);
      window.removeEventListener("product-updated", updateListener);
    };
  }, []);

  function loadProducts() {
    try {
      const raw = localStorage.getItem(PRODUCT_KEY);
      setProducts(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  }

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setShowOrderForm(true);
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    alert(`Order placed for ${selectedProduct.name} by ${formData.name}`);
    setShowOrderForm(false);
    setFormData({ name: "", address: "", phone: "" });
  };

  return (
    <div className="dashboard">
      <h2>🛍️ Product Dashboard</h2>
      <p>All products uploaded by the admin are displayed below.</p>

      <div className="product-grid">
        {products.length === 0 && (
          <div className="note">No products available yet.</div>
        )}

        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <p className="price">₦{product.price}</p>
              <p className="about">{product.about}</p>
              <button
                className="order-btn"
                onClick={() => handleOrderClick(product)}
              >
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Form Popup */}
      {showOrderForm && (
        <div className="order-overlay">
          <div className="order-popup">
            <h3>Order: {selectedProduct?.name}</h3>
            <form onSubmit={handleSubmitOrder}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Delivery Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
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
