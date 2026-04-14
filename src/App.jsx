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
  const [currentTab, setCurrentTab] = useState('Home');
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [user, setUser] = useState({ name: 'Guest', email: 'guest@sevzo.app', _id: null });
  const [backendMessage, setBackendMessage] = useState('Connecting to Sevzo backend...');
  const [adminData, setAdminData] = useState({ users: [], orders: [], inventory: [], wallets: [], partners: [], admins: [] });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminView, setAdminView] = useState('summary');
  const [adminMessage, setAdminMessage] = useState('Admin panel is ready.');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://sevzo-backend.vercel.app';
  const useBackend = true;

  const normalizeProduct = (item) => ({
    id: item._id || item.id || item.sku || item.productName || `${item.name}-${Math.random()}`,
    name: item.productName || item.name || item.title || 'Unnamed Item',
    price: item.price || item.cost || 0,
    image_url: item.image || item.image_url || item.photo || item.photo_url || '',
  });

  const fetchAdminData = async () => {
    if (!useBackend || !adminToken) return;

    setAdminLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admins/dashboard`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      const data = response.data || {};
      setAdminData({
        users: Array.isArray(data.users) ? data.users : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        inventory: Array.isArray(data.inventory) ? data.inventory : [],
        wallets: Array.isArray(data.wallets) ? data.wallets : [],
        partners: Array.isArray(data.partners) ? data.partners : [],
        admins: Array.isArray(data.admins) ? data.admins : []
      });
      setAdminMessage('Admin data loaded successfully.');
    } catch (error) {
      console.error('Admin panel error:', error);
      setAdminMessage('Unable to load admin data. Check backend deployment or admin credentials.');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('sevzoAdminToken');
    const storedEmail = localStorage.getItem('sevzoAdminEmail');
    if (storedToken && storedEmail) {
      setAdminToken(storedToken);
      setAdminEmail(storedEmail);
      setIsAdminAuthenticated(true);
    }

    const fetchInventory = async () => {
      setLoading(true);
      try {
        const endpoint = `${API_BASE}/api/inventory?category=${activeCat === 'All' ? '' : encodeURIComponent(activeCat)}`;
        const response = await axios.get(endpoint);
        const data = Array.isArray(response.data) ? response.data : [];
        setProducts(data.map(normalizeProduct));
        setBackendMessage('Connected to backend inventory successfully.');
      } catch (error) {
        console.error('API Error:', error);
        setBackendMessage('Backend inventory request failed. Check backend deployment.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [activeCat, API_BASE]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersResponse = await axios.get(`${API_BASE}/api/users?email=customer@sevzo.app&limit=1`);
        const foundUser = Array.isArray(usersResponse.data) && usersResponse.data.length > 0
          ? usersResponse.data[0]
          : null;
        if (foundUser) {
          setUser(foundUser);
          setBackendMessage('Connected to backend user data successfully.');
        }
      } catch (error) {
        console.error('User fetch error:', error);
      }
    };

    fetchUserData();
  }, [API_BASE]);

  useEffect(() => {
    const fetchBackendDetails = async () => {
      if (!user?._id) return;

      try {
        const [walletResponse, ordersResponse] = await Promise.all([
          axios.get(`${API_BASE}/api/wallets?ownerType=User&ownerId=${user._id}`),
          axios.get(`${API_BASE}/api/orders?userId=${user._id}`)
        ]);

        if (Array.isArray(walletResponse.data) && walletResponse.data.length > 0) {
          setWallet(walletResponse.data[0]);
        }
        if (Array.isArray(ordersResponse.data)) {
          setOrders(ordersResponse.data);
        }
      } catch (error) {
        console.error('Backend details error:', error);
      }
    };

    fetchBackendDetails();
  }, [API_BASE, user]);

  useEffect(() => {
    if (currentTab === 'Admin') {
      fetchAdminData();
    }
  }, [currentTab, API_BASE]);

  const handleDeleteItem = async (resource, id) => {
    if (!useBackend || !adminToken) return;

    const endpointMap = {
      users: 'users',
      orders: 'orders',
      inventory: 'inventory',
      wallets: 'wallets',
      partners: 'delivery-partners',
      admins: 'admins'
    };

    const path = endpointMap[resource];
    if (!path) return;

    try {
      await axios.delete(`${API_BASE}/api/${path}/${id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      setAdminMessage(`${resource.charAt(0).toUpperCase() + resource.slice(1)} deleted successfully.`);
      fetchAdminData();
    } catch (error) {
      console.error('Delete error:', error);
      setAdminMessage(`Unable to delete ${resource}.`);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) {
      setAdminLoginError('Please enter admin email and password.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/admins/login`, {
        email: adminEmail,
        password: adminPassword
      });

      const token = response.data.token;
      setAdminToken(token);
      setAdminEmail(adminEmail);
      setIsAdminAuthenticated(true);
      setAdminLoginError('');
      localStorage.setItem('sevzoAdminToken', token);
      localStorage.setItem('sevzoAdminEmail', adminEmail);
      setAdminMessage('Admin signed in successfully.');
      setCurrentTab('Admin');
      setShowAdminLoginModal(false);
      fetchAdminData();
    } catch (error) {
      console.error('Admin login error:', error);
      setAdminLoginError('Admin login failed. Check email and password.');
      setIsAdminAuthenticated(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    setIsAdminAuthenticated(false);
    setAdminEmail('');
    setAdminPassword('');
    setAdminLoginError('');
    localStorage.removeItem('sevzoAdminToken');
    localStorage.removeItem('sevzoAdminEmail');
    setAdminMessage('Admin logged out.');
    if (currentTab === 'Admin') {
      setCurrentTab('Home');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const cartTotalAmount = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartTotalItems = cart.reduce((total, item) => total + item.qty, 0);

  const renderHome = () => {
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <>
        <div className="top-header">
          <div className="header-row">
            <div className="location">
              <h2>Delivery in 10 mins</h2>
              <p>Jaipur, Rajasthan</p>
            </div>
            <div className="wallet-badge"><i className="fas fa-wallet"></i> ₹{wallet?.balance ?? 50}.00</div>
          </div>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search Tomatoes, Atta, Milk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="category-section">
          <h3 className="section-title">Grocery & Kitchen</h3>
          <div className="cat-scroll-container">
            <div className={`cat-box ${activeCat === 'All' ? 'active' : ''}`} onClick={() => { setActiveCat('All'); setSearchQuery(''); }}>
              <div className="cat-img-wrapper" style={{ background: '#f3f4f6' }}>
                <img src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" alt="All" />
              </div>
              <span>All Items</span>
            </div>
            {categoriesList.map((c) => (
              <div key={c.id} className={`cat-box ${activeCat === c.name ? 'active' : ''}`} onClick={() => { setActiveCat(c.name); setSearchQuery(''); }}>
                <div className="cat-img-wrapper" style={{ background: c.bg }}><img src={c.img} alt={c.name} /></div>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '6px solid #f3f4f6', margin: '5px 0 15px 0' }} />

        <div className="section-title">{searchQuery ? `Search: "${searchQuery}"` : `Showing: ${activeCat}`}</div>
        <div className="product-grid">
          {loading ? (
            <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '20px', color: '#999', fontWeight: 'bold' }}>Loading Data...</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(p => {
              const mainImage = p.image_url || 'https://cdn-icons-png.flaticon.com/512/878/878052.png';
              return (
                <div key={p.id} className="product-card">
                  <img src={mainImage} alt={p.name} onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/878/878052.png'; }} />
                  <h4>{p.name}</h4>
                  <div className="price-row">
                    <span className="price">₹{p.price}</span>
                    <button className="add-btn" onClick={() => addToCart(p)}>ADD</button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', gridColumn: 'span 2', padding: '40px 0', color: '#9ca3af' }}>
              <i className="fas fa-box-open" style={{ fontSize: '30px', marginBottom: '10px' }}></i>
              <p>No products found.</p>
            </div>
          )}
        </div>
      </>
    );
  };

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

  const renderOrders = () => (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>My Orders</h2>
      {useBackend ? (
        orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} style={{ background: '#fff', padding: '18px', borderRadius: '16px', marginBottom: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <strong>Order # {order.orderNumber}</strong>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{order.orderStatus}</p>
                </div>
                <div style={{ fontWeight: '800', color: '#111' }}>₹{order.totalAmount}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>
                {order.items?.map((item) => (
                  <div key={item._id || item.name} style={{ marginBottom: '5px' }}>{item.quantity} x {item.name}</div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#9ca3af' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/3500/3500833.png" style={{ width: '70px', marginBottom: '20px', opacity: 0.8 }} alt="Orders" />
            <p style={{ fontWeight: '700' }}>No orders found</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Your past orders will appear here when backend is connected.</p>
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#9ca3af' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/3500/3500833.png" style={{ width: '70px', marginBottom: '20px', opacity: 0.8 }} alt="Orders" />
          <p style={{ fontWeight: '700' }}>Backend not connected</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Add VITE_API_URL to your frontend environment to load real orders.</p>
        </div>
      )}
    </div>
  );

  const renderAccount = () => (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ width: '60px', height: '60px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '24px' }}>👤</div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{user.name}</h2>
          <p style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>{user.email}</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px', color: '#6b7280', fontWeight: '700' }}>Wallet Balance</div>
        <div style={{ fontSize: '32px', fontWeight: '800' }}>₹{wallet?.balance ?? 0}</div>
        <p style={{ marginTop: '10px', color: '#4b5563', fontSize: '13px' }}>{wallet ? wallet.transactions?.length + ' transactions' : 'Connect backend to show wallet transactions.'}</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
        <div style={{ padding: '15px 0', borderBottom: '1px solid #f3f4f6', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}><span>Saved Addresses</span> <span>›</span></div>
        <div style={{ padding: '15px 0', borderBottom: '1px solid #f3f4f6', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}><span>Support & Help</span> <span>›</span></div>
        <div style={{ padding: '15px 0', fontWeight: '600', color: '#ff005c', display: 'flex', justifyContent: 'space-between' }}><span>Logout</span></div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        {!isAdminAuthenticated ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ fontWeight: '700', color: '#111' }}>Admin Access</div>
            <div style={{ color: '#6b7280', fontSize: '13px' }}>Only authorized admins can open the dashboard. Use the login modal to authenticate.</div>
            <button
              onClick={() => setShowAdminLoginModal(true)}
              style={{ width: '100%', background: '#111', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700' }}
            >
              Open admin login
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700' }}>Admin access enabled</div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>{adminEmail}</div>
            </div>
            <button onClick={handleAdminLogout} style={{ background: '#ff005c', color: '#fff', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
              Logout
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', background: '#fff', borderRadius: '16px', padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
        {backendMessage}
      </div>
    </div>
  );

  const renderAdmin = () => {
    const summaryCards = [
      { label: 'Users', value: adminData.users.length },
      { label: 'Orders', value: adminData.orders.length },
      { label: 'Inventory', value: adminData.inventory.length },
      { label: 'Wallets', value: adminData.wallets.length },
      { label: 'Partners', value: adminData.partners.length },
      { label: 'Admins', value: adminData.admins.length }
    ];
    const listData = adminData[adminView] || [];

    return (
      <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Sevzo Admin</h2>
            <p style={{ marginTop: '4px', color: '#6b7280', fontSize: '13px' }}>{adminMessage}</p>
          </div>
          <button onClick={fetchAdminData} style={{ background: '#ff005c', color: '#fff', padding: '10px 16px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '18px' }}>
          {summaryCards.map(card => (
            <div key={card.label} style={{ background: '#fff', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '700' }}>{card.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            {['summary', 'users', 'orders', 'inventory', 'wallets', 'partners', 'admins'].map(section => (
              <button
                key={section}
                onClick={() => setAdminView(section)}
                style={{
                  background: adminView === section ? '#ff005c' : '#f3f4f6',
                  color: adminView === section ? '#fff' : '#111',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {adminLoading ? (
            <p style={{ color: '#6b7280', fontWeight: '700' }}>Loading admin data...</p>
          ) : adminView === 'summary' ? (
            <div style={{ color: '#4b5563', lineHeight: '1.7' }}>
              <p>Use the admin panel to review users, orders, inventory, wallets, delivery partners, and system admins.</p>
              <p>Tap any list button to inspect details and use delete actions where needed.</p>
            </div>
          ) : (
            <div>
              {listData.length === 0 ? (
                <p style={{ color: '#9ca3af', fontWeight: '700' }}>No records found for {adminView}.</p>
              ) : (
                listData.map(item => (
                  <div key={item._id || item.id || item.name || JSON.stringify(item)} style={{ marginBottom: '12px', background: '#f9fafb', borderRadius: '14px', padding: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                          {adminView === 'users' && item.name}
                          {adminView === 'orders' && item.orderNumber}
                          {adminView === 'inventory' && item.productName}
                          {adminView === 'wallets' && `${item.ownerType} ${item.balance ?? ''}`}
                          {adminView === 'partners' && item.name}
                          {adminView === 'admins' && item.name}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>
                          {adminView === 'users' && item.email}
                          {adminView === 'orders' && `${item.orderStatus} • ₹${item.totalAmount}`}
                          {adminView === 'inventory' && `${item.category || ''} • ₹${item.price}`}
                          {adminView === 'wallets' && `${item.ownerType} • ${item.currency}`}
                          {adminView === 'partners' && `${item.email || ''} • ${item.status || ''}`}
                          {adminView === 'admins' && item.email}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteItem(adminView, item._id || item.id)} style={{ background: '#ff005c', color: '#fff', padding: '8px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div style={{ paddingBottom: '70px' }}>
        {currentTab === 'Home' && renderHome()}
        {currentTab === 'Cart' && renderCart()}
        {currentTab === 'Orders' && renderOrders()}
        {currentTab === 'Account' && renderAccount()}
        {currentTab === 'Admin' && renderAdmin()}
      </div>

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
        {isAdminAuthenticated && (
          <div className={`nav-item ${currentTab === 'Admin' ? 'active' : ''}`} onClick={() => setCurrentTab('Admin')}>
            <i className="fas fa-shield-alt"></i>Admin
          </div>
        )}
      </div>

      {showAdminLoginModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Admin Login</h3>
                <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '13px' }}>Enter your admin credentials to view the dashboard.</p>
              </div>
              <button onClick={() => setShowAdminLoginModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <input
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              type="email"
              placeholder="Admin email"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', marginBottom: '14px' }}
            />
            <input
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              type="password"
              placeholder="Admin password"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', marginBottom: '14px' }}
            />
            {adminLoginError && <div style={{ color: '#dc2626', marginBottom: '14px', fontSize: '13px' }}>{adminLoginError}</div>}
            <button
              onClick={handleAdminLogin}
              style={{ width: '100%', background: '#111', color: '#fff', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700' }}
            >
              Sign in as admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;