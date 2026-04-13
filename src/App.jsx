import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Categories from './components/Categories';
import BottomNav from './components/BottomNav';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- API CALL ---
  const fetchProducts = async (category) => {
    setLoading(true);
    try {
      // Yahan apna sahi PHP URL dalein
      const res = await axios.get(`https://mall.zaminzaydaat.com/get_products.php?category=${category}`);
      setProducts(res.data);
    } catch (error) {
      console.error("API Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Jab category change ho toh data fetch karein
  useEffect(() => {
    fetchProducts(activeCat);
  }, [activeCat]);

  // --- CART LOGIC ---
  const handleAddToCart = (e) => {
    const btn = e.target;
    btn.innerText = "ADDED ✓";
    btn.style.background = "#ff005c";
    btn.style.color = "white";
    setCartCount(prev => prev + 1);

    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      btn.innerText = "ADD";
      btn.style.background = "white";
      btn.style.color = "#ff005c";
    }, 1000);
  };

  // --- SEARCH FILTER ---
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      
      {/* 1. Header Component */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      {/* 2. Categories Section */}
      <Categories 
        activeCat={activeCat} 
        setActiveCat={setActiveCat} 
        setSearchQuery={setSearchQuery} 
      />

      <hr style={{ border: 0, borderTop: '6px solid #f8fafc', margin: '15px 0' }} />

      {/* 3. Product Grid */}
      <div className="section-title">
        {searchQuery ? `Search Results for "${searchQuery}"` : `Showing: ${activeCat}`}
      </div>

      <div className="product-grid">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: 'span 2', padding: '20px', color: '#999' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading inventory...
          </p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(p => {
            // Multiple images me se pehli uthana
            const mainImg = p.image_url ? p.image_url.split(',')[0].trim() : 'https://via.placeholder.com/150';
            
            return (
              <div key={p.id} className="product-card">
                <img 
                  src={mainImg} 
                  alt={p.name} 
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'} 
                />
                <h4>{p.name}</h4>
                <div className="price-row">
                  <span className="price">₹{p.price}</span>
                  <button className="add-btn" onClick={handleAddToCart}>ADD</button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', gridColumn: 'span 2', padding: '40px 20px', color: '#9ca3af' }}>
            <i className="fas fa-search" style={{ fontSize: '40px', color: '#eee', marginBottom: '10px' }}></i>
            <p>No products found in this area.</p>
          </div>
        )}
      </div>

      {/* 4. Bottom Navigation Component */}
      <BottomNav cartCount={cartCount} />

    </div>
  );
}

export default App;