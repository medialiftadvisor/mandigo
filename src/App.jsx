import React, { useState } from 'react';
import './index.css';

// --- MOCK DATA (Testing ke liye premium images ke sath) ---
const mockCategories = [
  { id: 1, name: 'Vegetables & Fruits', img: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png', bg: '#e8f5e9' },
  { id: 2, name: 'Atta, Rice & Dal', img: 'https://cdn-icons-png.flaticon.com/512/6888/6888125.png', bg: '#f1f8e9' },
  { id: 3, name: 'Oil, Ghee & Masala', img: 'https://cdn-icons-png.flaticon.com/512/3348/3348084.png', bg: '#fff8e1' },
  { id: 4, name: 'Dairy & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050114.png', bg: '#e3f2fd' },
];

const mockProducts = [
  { id: 101, category: 'Vegetables & Fruits', name: 'Fresh Organic Tomatoes (500g)', price: 40, img: 'https://p.kindpng.com/picc/s/181-1810141_fresh-tomato-png-tomato-png-transparent-png.png' },
  { id: 102, category: 'Vegetables & Fruits', name: 'Potatoes - Hybrid (1kg)', price: 25, img: 'https://p.kindpng.com/picc/s/130-1309852_potato-hd-png-raw-potatoes-png-transparent-png.png' },
  { id: 103, category: 'Atta, Rice & Dal', name: 'Aashirvaad Atta (5kg)', price: 210, img: 'https://www.westsidemarket.com/media/catalog/product/placeholder/default/aashirvaad-atta.png' },
  { id: 104, category: 'Dairy & Eggs', name: 'Amul Taza Milk (1L)', price: 60, img: 'https://cdn.grofers.com/app/images/products/full_screen/pro_3297.jpg' },
  { id: 105, category: 'Dairy & Eggs', name: 'Fresh Farm Eggs (12 pack)', price: 96, img: 'https://p.kindpng.com/picc/s/131-1317544_egg-transparent-png-farm-fresh-eggs-transparent-png.png' },
];

// --- APP COMPONENT ---
function App() {
  const [activeCat, setActiveCat] = useState('Vegetables & Fruits');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Filter Products based on Category & Search
  const filteredProducts = mockProducts.filter(p => 
    p.category === activeCat && 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          {mockCategories.map((c) => (
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
        {searchQuery ? `Search: "${searchQuery}"` : activeCat}
      </div>
      
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(p => (
            <div key={p.id} className="product-card">
              <img src={p.img} alt={p.name} onError={(e) => e.target.src='https://via.placeholder.com/150'} />
              <h4>{p.name}</h4>
              <div className="price-row">
                <span className="price">₹{p.price}</span>
                <button className="add-btn" onClick={() => setCartCount(c => c+1)}>ADD</button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: 'span 2', padding: '40px 0', color: '#9ca3af' }}>
            <i className="fas fa-search" style={{ fontSize: '30px', marginBottom: '10px' }}></i>
            <p>No products found in {activeCat}.</p>
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