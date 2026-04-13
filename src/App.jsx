import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const categoriesList = [
  { id: 1, name: 'Vegetables & Fruits', img: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png', bg: '#e8f5e9' },
  { id: 2, name: 'Atta, Rice & Dal', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082011.png', bg: '#f1f8e9' },
  { id: 3, name: 'Oil, Ghee & Masala', img: 'https://cdn-icons-png.flaticon.com/512/3348/3348084.png', bg: '#fff8e1' },
  { id: 4, name: 'Dairy & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050114.png', bg: '#e3f2fd' },
];

function App() {
  // Navigation State (Current Page kaunsa hai)
  const [currentTab, setCurrentTab] = useState('Home'); 
  
  // Home Page States
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // REAL CART STATE (Sirf number nahi, ab items save honge)
  const [cart, setCart] = useState([]);

  // API Call (Hostinger)
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://mall.zaminzaydaat.com/get_products.php?category=${activeCat === 'All' ? '' : activeCat}`);
        setProducts(response.data);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [activeCat]);

  // Cart me item add karna
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // Cart ka total bill aur total items
  const cartTotalAmount = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartTotalItems = cart.reduce((total, item) => total + item.qty, 0);

  // --- PAGES (Views) ---

  // 1. HOME PAGE
  const renderHome = () => {
    const filteredProducts = products.filter(p => p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <>
        {/* Sticky Header */}
        <div className="top-header">
          <div className="header-row">
            <div className="location">
              <h2>Delivery in 10 mins</h2>
              <p>Jaipur, Rajasthan <i className="fas fa-caret-down"></i></p>
            </div>
            <div className="wallet-badge"><i className="fas fa-wallet"></i> ₹ 50.00</div>
          </div>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search Tomatoes, Atta, Milk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Categories */}
        <div className="category-section">
          <h3 className="section-title">Grocery & Kitchen</h3>
          <div className="cat-scroll-container">
            <div className={`cat-box ${activeCat === 'All' ? 'active' : ''}`} onClick={() => setActiveCat('All')}>
              <div className="cat-img-wrapper" style={{ background: '#f3f4f6' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" alt="All" />
              </div>
              <span>All Items</span>
            </div>
            {categoriesList.map((c) => (
              <div key={c.id} className={`cat-box ${activeCat === c.name ? 'active' : ''}`} onClick={() => {setActiveCat(c.name); setSearchQuery('');}}>
                <div className="cat-img-wrapper" style={{ background: c.bg }}><img src={c.img} alt={c.name} /></div>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '6px solid #f3f4f6', margin: '5px 0 15px 0' }} />

        {/* Product Grid */}
        <div className="section-title">{searchQuery ? `Search: "${searchQuery}"` : `Showing: ${activeCat}`}</div>
        <div className="product-grid">
          {loading ? (
            <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '20px', color: '#999', fontWeight: 'bold' }}>Loading Data...</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(p => {
              const imgPath = p.image_url || p.image || p.photo || '';
              let mainImage = imgPath ? imgPath.split(',')[0].trim() : 'https://cdn-icons-png.flaticon.com/512/878/878052.png';
              if (mainImage && !mainImage.startsWith('http')) { mainImage = `https://mall.zaminzaydaat.com/${mainImage}`; }

              return (
                <div key={p.id} className="product-card">
                  <img src={mainImage} alt={p.name} onError={(e) => e.target.src='https://cdn-icons-png.flaticon.com/512/878/878052.png'} />
                  <h4>{p.name}</h4>
                  <div className="price-row">
                    <span className="price">₹{p.price}</span>
                    <button className="add-btn" onClick={() => addToCart(p)}>ADD</button>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', gridColumn: 'span 2', padding: '40px 0', color: '#9ca3af' }}><i className="fas fa-box-open" style={{ fontSize: '30px', marginBottom: '10px' }}></i><p>No products found.</p></div>
          )}
        </div>
      </>
    );
  };

  // 2. CART PAGE (Sundar Cart UI)
  const renderCart = () => (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Your Cart</h2>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#9ca3af' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" style={{ width: '100px', opacity: 0.5, marginBottom: '15px' }} alt="Empty Cart" />
          <p style={{ fontWeight: '600', fontSize: '16px' }}>Your cart is empty</p>
          <p style={{ fontSize: '12px', marginTop: '5px' }}>Add items from home page to start shopping.</p>
        </div>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={index} style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '5px' }}>{item.name}</h4>
                <p style={{ color: '#ff005c', fontWeight: '800', fontSize: '14px' }}>₹{item.price} x {item.qty}</p>
              </div>
              <div style={{ fontWeight: '800', fontSize: '16px' }}>₹{item.price * item.qty}</div>
            </div>
          ))}
          
          <div style={{ marginTop: '20px', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '600' }}><span>Item Total</span><span>₹{cartTotalAmount}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '600' }}><span>Delivery Fee</span><span style={{ color: '#10b981' }}>FREE</span></div>
            <hr style={{ border: 0, borderTop: '1px dashed #e5e7eb', margin: '15px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px' }}><span>Grand Total</span><span>₹{cartTotalAmount}</span></div>
          </div>
          
          <button style={{ width: '100%', background: '#ff005c', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', border: 'none', marginTop: '20px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,0,92,0.3)' }}>
            Proceed to Pay ₹{cartTotalAmount}
          </button>
        </>
      )}
    </div>
  );

  // 3. ORDERS PAGE
  const renderOrders = () => (
    <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
      <img src="https://cdn-icons-png.flaticon.com/512/3500/3500833.png" style={{ width: '80px', marginBottom: '20px', opacity: 0.8 }} alt="Orders" />
      <h2 style={{ fontWeight: '800', fontSize: '20px' }}>No Active Orders</h2>
      <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>Your recent orders and tracking details will appear here.</p>
    </div>
  );

  // 4. ACCOUNT PAGE
  const renderAccount = () => (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ width: '60px', height: '60px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '24px' }}>👤</div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>My Profile</h2>
          <p style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>+91 9876543210</p>
        </div>
      </div>
      
      <div style={{ background: '#fff', borderRadius: '16px', padding: '10px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '15px 0', borderBottom: '1px solid #f3f4f6', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}><span>📍 Saved Addresses</span> <span>›</span></div>
        <div style={{ padding: '15px 0', borderBottom: '1px solid #f3f4f6', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}><span>💬 Support & Help</span> <span>›</span></div>
        <div style={{ padding: '15px 0', fontWeight: '600', color: '#ff005c', display: 'flex', justifyContent: 'space-between' }}><span>🚪 Logout</span> </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      
      {/* Dynamic Page Rendering (Jo tab click hoga, wo page dikhega) */}
      <div style={{ paddingBottom: '70px' }}>
        {currentTab === 'Home' && renderHome()}
        {currentTab === 'Cart' && renderCart()}
        {currentTab === 'Orders' && renderOrders()}
        {currentTab === 'Account' && renderAccount()}
      </div>

      {/* BOTTOM NAV (Premium Clickable Tabs) */}
      <div className="bottom-nav">
        <div className={`nav-item ${currentTab === 'Home' ? 'active' : ''}`} onClick={() => setCurrentTab('Home')}>
          <i className="fas fa-home"></i>Home
        </div>
        <div className={`nav-item ${currentTab === 'Orders' ? 'active' : ''}`} onClick={() => setCurrentTab('Orders')}>
          <i className="fas fa-receipt"></i>Orders
        </div>
        <div className={`nav-item ${currentTab === 'Cart' ? 'active' : ''}`} onClick={() => setCurrentTab('Cart')} style={{ position: 'relative' }}>
          <i className="fas fa-shopping-cart"></i>Cart
          {cartTotalItems > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '15px', background: '#ff005c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', border: '2px solid white' }}>
              {cartTotalItems}
            </span>
          )}
        </div>
        <div className={`nav-item ${currentTab === 'Account' ? 'active' : ''}`} onClick={() => setCurrentTab('Account')}>
          <i className="fas fa-user"></i>Account
        </div>
      </div>

    </div>
  );
}

export default App;