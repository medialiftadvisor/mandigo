import React, { useState, useEffect } from 'react';
import axios from 'axios'; // API call ke liye
import './index.css';

// Premium Categories (Icons fix kar diye gaye hain)
const categoriesList = [
  { id: 1, name: 'Vegetables & Fruits', img: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png', bg: '#e8f5e9' },
  { id: 2, name: 'Atta, Rice & Dal', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082011.png', bg: '#f1f8e9' }, // Sahi icon
  { id: 3, name: 'Oil, Ghee & Masala', img: 'https://cdn-icons-png.flaticon.com/512/3348/3348084.png', bg: '#fff8e1' },
  { id: 4, name: 'Dairy & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050114.png', bg: '#e3f2fd' },
];

function App() {
  const [activeCat, setActiveCat] = useState('All'); // Default sab dikhega
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  
  // Real Database Data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- AAPKA HOSTINGER API CONNECTION ---
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        // Aapka asli PHP URL (Category filter ke sath)
        const response = await axios.get(`https://mall.zaminzaydaat.com/get_products.php?category=${activeCat === 'All' ? '' : activeCat}`);
        setProducts(response.data);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [activeCat]); // Jab bhi category change hogi, naya data aayega

  // Search Filter
  const filteredProducts = products.filter(p => 
    p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      
      {/* 1. STICKY HEADER */}
      <div className="top-header">
        <div className="header-row">
          <div className="location">
            <h2>Delivery in 10 mins</h2>
            <p>Jaipur, Rajasthan <i className="fas fa-caret-down"></i></p>
          </div>
          <div className="wallet-badge">
            <i className="fas fa-wallet"></i> ₹ 50.00
          </div>
        </div>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search Tomatoes, Atta, Milk..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 2. CATEGORY SECTION */}
      <div className="category-section">
        <h3 className="section-title">Grocery & Kitchen</h3>
        <div className="cat-scroll-container">
          {/* ALL button */}
          <div className={`cat-box ${activeCat === 'All' ? 'active' : ''}`} onClick={() => setActiveCat('All')}>
            <div className="cat-img-wrapper" style={{ background: '#f3f4f6' }}>
              <img src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" alt="All" />
            </div>
            <span>All Items</span>
          </div>

          {/* Baki Categories */}
          {categoriesList.map((c) => (
            <div 
              key={c.id} 
              className={`cat-box ${activeCat === c.name ? 'active' : ''}`}
              onClick={() => {setActiveCat(c.name); setSearchQuery('');}}
            >
              <div className="cat-img-wrapper" style={{ background: c.bg }}>
                <img src={c.img} alt={c.name} />
              </div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ border: 0, borderTop: '6px solid #f3f4f6', margin: '5px 0 15px 0' }} />

      {/* 3. PRODUCT GRID */}
      <div className="section-title">
        {searchQuery ? `Search: "${searchQuery}"` : `Showing: ${activeCat}`}
      </div>
      
      <div className="product-grid">
        {loading ? (
          <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '20px', color: '#999', fontWeight: 'bold' }}>Loading Real Data...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(p => {
            // Asli image URL nikalna (agar ek se zyada hain)
            const mainImage = p.image_url ? p.image_url.split(',')[0].trim() : 'https://cdn-icons-png.flaticon.com/512/878/878052.png';

            return (
              <div key={p.id} className="product-card">
                <img src={mainImage} alt={p.name} onError={(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/878/878052.png'} />
                <h4>{p.name}</h4>
                <div className="price-row">
                  <span className="price">₹{p.price}</span>
                  <button className="add-btn" onClick={() => setCartCount(c => c+1)}>ADD</button>
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ textAlign: 'center', gridColumn: 'span 2', padding: '40px 0', color: '#9ca3af' }}>
            <i className="fas fa-box-open" style={{ fontSize: '30px', marginBottom: '10px' }}></i>
            <p>No products found.</p>
          </div>
        )}
      </div>

      {/* 4. BOTTOM NAV */}
      <div className="bottom-nav">
        <div className="nav-item active"><i className="fas fa-home"></i>Home</div>
        <div className="nav-item"><i className="fas fa-receipt"></i>Orders</div>
        <div className="nav-item" style={{ position: 'relative' }}>
          <i className="fas fa-shopping-cart"></i>Cart
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '15px', background: '#ff005c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', border: '2px solid white' }}>
              {cartCount}
            </span>
          )}
        </div>
        <div className="nav-item"><i className="fas fa-user"></i>Account</div>
      </div>

    </div>
  );
}

export default App;