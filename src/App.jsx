import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const categoriesList = [
  { id: 1, name: 'Vegetables & Fruits', img: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png', bg: '#d1fae5' },
  { id: 2, name: 'Atta, Rice & Dal', img: 'https://cdn-icons-png.flaticon.com/512/892/892634.png', bg: '#fef3c7' },
  { id: 3, name: 'Oil, Ghee & Masala', img: 'https://cdn-icons-png.flaticon.com/512/5504/5504410.png', bg: '#fff7ed' },
  { id: 4, name: 'Dairy & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/3140/3140577.png', bg: '#dbeafe' },
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
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
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
  const [authType, setAuthType] = useState('user');
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authVehicle, setAuthVehicle] = useState('');
  const [authError, setAuthError] = useState('');
  const [profileAddress, setProfileAddress] = useState({
    line1: '', line2: '', city: '', state: '', postalCode: '', country: '',
    location: { latitude: '', longitude: '' }
  });
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [deliveryPinInput, setDeliveryPinInput] = useState('');
  const [orderConfirmationMessage, setOrderConfirmationMessage] = useState('');
  const [promoMessage, setPromoMessage] = useState('Save ₹100 on your first PhonePe order. Use UPI my1504@ybl.');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productEditData, setProductEditData] = useState({ description: '', images: ['', '', '', '', ''] });

  const API_BASE = import.meta.env.VITE_API_URL || 'https://sevzo-backend.vercel.app';
  const useBackend = true;

  const normalizeProduct = (item) => ({
    id: item._id || item.id || item.sku || item.productName || `${item.name}-${Math.random()}`,
    name: item.productName || item.name || item.title || 'Unnamed Item',
    price: item.price || item.cost || 0,
    image_url: item.images?.[0] || item.image || item.image_url || item.photo || item.photo_url || '',
    category: item.category || item.type || 'General',
    description: item.description || 'No description available.',
    images: item.images || [item.image || item.image_url || item.photo || item.photo_url || '']
  });

  const fetchAdminData = async () => {
    if (!useBackend || !adminToken) return;
    setAdminLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admins/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
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
      setAdminMessage('Unable to load admin data.');
    } finally { setAdminLoading(false); }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('sevzoAdminToken');
    const storedEmail = localStorage.getItem('sevzoAdminEmail');
    if (storedToken && storedEmail) {
      setAdminToken(storedToken); setAdminEmail(storedEmail);
      setIsAdminAuthenticated(true);
    }
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const endpoint = `${API_BASE}/api/inventory?category=${activeCat === 'All' ? '' : encodeURIComponent(activeCat)}`;
        const response = await axios.get(endpoint);
        setProducts((Array.isArray(response.data) ? response.data : []).map(normalizeProduct));
      } catch (error) { setBackendMessage('Inventory failed.'); }
      finally { setLoading(false); }
    };
    fetchInventory();
  }, [activeCat, API_BASE]);

  useEffect(() => {
    const storedUserEmail = localStorage.getItem('sevzoUserEmail');
    const storedPartnerEmail = localStorage.getItem('sevzoPartnerEmail');
    const fetchUserData = async () => {
      if (!storedUserEmail) return;
      try {
        const res = await axios.get(`${API_BASE}/api/users?email=${encodeURIComponent(storedUserEmail)}&limit=1`);
        const found = res.data?.[0];
        if (found) { setUser(found); setProfileAddress(found.address || profileAddress); }
      } catch (e) { console.error(e); }
    };
    fetchUserData();
  }, [API_BASE]);

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) { setAdminLoginError('Required'); return; }
    try {
      const res = await axios.post(`${API_BASE}/api/admins/login`, { email: adminEmail, password: adminPassword });
      setAdminToken(res.data.token); setIsAdminAuthenticated(true);
      localStorage.setItem('sevzoAdminToken', res.data.token);
      localStorage.setItem('sevzoAdminEmail', adminEmail);
      setCurrentTab('Admin'); setShowAdminLoginModal(false);
      fetchAdminData();
    } catch (e) { setAdminLoginError('Login Failed'); }
  };

  const handleAuthSubmit = async () => {
    const payload = { email: authEmail, password: authPassword, name: authName, phone: authPhone };
    try {
      const endpoint = authType === 'user' ? '/api/users' : '/api/delivery-partners';
      const loginSuffix = authMode === 'login' ? '/login' : '';
      const response = await axios.post(`${API_BASE}${endpoint}${loginSuffix}`, payload);
      if (authType === 'user') { setUser(response.data); localStorage.setItem('sevzoUserEmail', response.data.email); }
      else { setPartner(response.data); localStorage.setItem('sevzoPartnerEmail', response.data.email); }
      setCurrentTab('Home');
    } catch (e) { setAuthError('Auth failed'); }
  };

  const handlePayWithPhonePe = async () => {
    if (!user) { setCurrentTab('Account'); return; }
    try {
      const deliveryPin = `${Math.floor(1000 + Math.random() * 9000)}`;
      const orderPayload = {
        orderNumber: `MDG${Date.now()}`,
        user: user._id,
        items: cart.map(i => ({ inventory: i.id, name: i.name, quantity: i.qty, price: i.price, total: i.price * i.qty })),
        totalAmount: cartTotalAmount,
        deliveryPin,
        shippingAddress: profileAddress
      };
      const response = await axios.post(`${API_BASE}/api/orders`, orderPayload);
      setOrders([response.data, ...orders]); setTrackingOrder(response.data);
      setCart([]); setOrderConfirmationMessage(`Order Placed. PIN: ${deliveryPin}`);
      window.open(`upi://pay?pa=my1504@ybl&pn=Mandigo&am=${cartTotalAmount}&cu=INR`, '_blank');
    } catch (e) { setAuthError('Order Failed'); }
  };

  const captureLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setProfileAddress({ ...profileAddress, location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } });
    });
  };

  const saveProductEdits = async () => {
    if (!selectedProduct?.id || !adminToken) return;
    try {
      const payload = { description: productEditData.description, images: productEditData.images.filter(Boolean) };
      const response = await axios.put(`${API_BASE}/api/inventory/${selectedProduct.id}`, payload, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setSelectedProduct({ ...selectedProduct, ...response.data });
      fetchAdminData();
    } catch (e) { setAuthError('Update failed'); }
  };

  const renderHome = () => {
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <>
        <div className="top-header" style={{padding: '20px', background: '#fff'}}>
          <h2>Delivery in 10 mins</h2>
          <div className="search-box">
            <input type="text" placeholder="Search..." onChange={(e) => setSearchQuery(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd'}} />
          </div>
        </div>
        <div className="product-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px'}}>
          {filtered.map(p => (
            <div key={p.id} className="product-card" style={{background: '#fff', padding: '10px', borderRadius: '15px', textAlign: 'center'}}>
              <img src={p.image_url} onClick={() => setSelectedProduct(p)} style={{width: '100%', height: '120px', objectFit: 'contain'}} />
              <h4>{p.name}</h4>
              <p>₹{p.price}</p>
              <button onClick={() => {
                const ex = cart.find(i => i.id === p.id);
                if(ex) setCart(cart.map(i => i.id === p.id ? {...i, qty: i.qty+1} : i));
                else setCart([...cart, {...p, qty: 1}]);
              }} style={{background: '#ff005c', color: '#fff', border: 'none', width: '100%', padding: '8px', borderRadius: '8px'}}>ADD</button>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderProductDetail = () => (
    <div style={{ padding: '20px', background: '#f9fafb', minHeight: '100vh' }}>
      <button onClick={() => setSelectedProduct(null)} style={{padding: '10px', marginBottom: '15px'}}>← Back</button>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '20px' }}>
        <img src={selectedProduct.images?.[0]} style={{width: '100%', height: '240px', objectFit: 'cover', borderRadius: '15px'}} />
        <h2>{selectedProduct.name}</h2>
        <p>{selectedProduct.description}</p>
        <div style={{fontSize: '24px', fontWeight: '800', margin: '15px 0'}}>₹{selectedProduct.price}</div>
        <button onClick={() => {
             const ex = cart.find(i => i.id === selectedProduct.id);
             if(ex) setCart(cart.map(i => i.id === selectedProduct.id ? {...i, qty: i.qty+1} : i));
             else setCart([...cart, {...selectedProduct, qty: 1}]);
        }} style={{width: '100%', padding: '15px', background: '#ff005c', color: '#fff', border: 'none', borderRadius: '15px'}}>Add to Cart</button>
        
        {isAdminAuthenticated && (
          <div style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
            <h3>Admin Edit</h3>
            <textarea value={productEditData.description} onChange={e => setProductEditData({...productEditData, description: e.target.value})} style={{width: '100%', height: '100px'}} />
            <button onClick={saveProductEdits} style={{width: '100%', background: '#111', color: '#fff', padding: '10px', marginTop: '10px'}}>Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );

  const cartTotalAmount = cart.reduce((t, i) => t + (i.price * i.qty), 0);
  const cartTotalItems = cart.reduce((t, i) => t + i.qty, 0);

  return (
    <div className="app-container">
      <div style={{ paddingBottom: '70px' }}>
        {selectedProduct ? renderProductDetail() : (
          <>
            {currentTab === 'Home' && renderHome()}
            {currentTab === 'Cart' && (
              <div style={{padding: '20px'}}>
                <h2>Cart Total: ₹{cartTotalAmount}</h2>
                <button onClick={handlePayWithPhonePe} style={{width: '100%', padding: '15px', background: '#0e6efc', color: '#fff', borderRadius: '10px', border: 'none'}}>Pay with PhonePe</button>
                {orderConfirmationMessage && <p style={{color: 'green'}}>{orderConfirmationMessage}</p>}
              </div>
            )}
            {currentTab === 'Account' && (
              <div style={{padding: '20px'}}>
                {user ? (
                  <div>
                    <h3>Welcome, {user.name}</h3>
                    <input value={profileAddress.line1} onChange={e => setProfileAddress({...profileAddress, line1: e.target.value})} placeholder="Address" style={{width: '100%', padding: '10px', marginBottom: '10px'}} />
                    <button onClick={captureLocation}>Capture GPS</button>
                    <button onClick={() => {setUser(null); localStorage.removeItem('sevzoUserEmail');}}>Logout</button>
                  </div>
                ) : (
                  <div>
                    <input placeholder="Email" onChange={e => setAuthEmail(e.target.value)} />
                    <input type="password" placeholder="Password" onChange={e => setAuthPassword(e.target.value)} />
                    <button onClick={handleAuthSubmit}>Login/Register</button>
                  </div>
                )}
              </div>
            )}
            {currentTab === 'Admin' && <div style={{padding: '20px'}}>Admin Dashboard: {adminData.inventory.length} items</div>}
          </>
        )}
      </div>

      <div className="bottom-nav" style={{position: 'fixed', bottom: 0, width: '100%', display: 'flex', justifyContent: 'space-around', background: '#fff', padding: '15px', borderTop: '1px solid #eee'}}>
        <div onClick={() => setCurrentTab('Home')}>Home</div>
        <div onClick={() => setCurrentTab('Cart')}>Cart ({cartTotalItems})</div>
        <div onClick={() => setCurrentTab('Account')}>Account</div>
        <div onClick={() => isAdminAuthenticated ? setCurrentTab('Admin') : setShowAdminLoginModal(true)}>Admin</div>
      </div>

      {showAdminLoginModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{background: '#fff', padding: '20px', borderRadius: '15px', width: '80%'}}>
            <h3>Admin Login</h3>
            <input placeholder="Email" onChange={e => setAdminEmail(e.target.value)} style={{width: '100%', marginBottom: '10px'}} />
            <input type="password" placeholder="Password" onChange={e => setAdminPassword(e.target.value)} style={{width: '100%', marginBottom: '10px'}} />
            <button onClick={handleAdminLogin} style={{width: '100%', background: '#111', color: '#fff'}}>Login</button>
            <button onClick={() => setShowAdminLoginModal(false)} style={{width: '100%', marginTop: '10px'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;