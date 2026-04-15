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
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    location: { latitude: '', longitude: '' }
  });
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [deliveryPinInput, setDeliveryPinInput] = useState('');
  const [orderConfirmationMessage, setOrderConfirmationMessage] = useState('');
  const [promoMessage, setPromoMessage] = useState('Save ₹100 on your first PhonePe order. Use UPI my1504@ybl.');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
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
    const storedUserEmail = localStorage.getItem('sevzoUserEmail');
    const storedPartnerEmail = localStorage.getItem('sevzoPartnerEmail');

    const fetchUserData = async () => {
      if (!storedUserEmail) return;
      try {
        const usersResponse = await axios.get(`${API_BASE}/api/users?email=${encodeURIComponent(storedUserEmail)}&limit=1`);
        const foundUser = Array.isArray(usersResponse.data) && usersResponse.data.length > 0
          ? usersResponse.data[0]
          : null;
        if (foundUser) {
          setUser(foundUser);
          setProfileAddress({
            line1: foundUser.address?.line1 || '',
            line2: foundUser.address?.line2 || '',
            city: foundUser.address?.city || '',
            state: foundUser.address?.state || '',
            postalCode: foundUser.address?.postalCode || '',
            country: foundUser.address?.country || '',
            location: {
              latitude: foundUser.address?.location?.latitude || '',
              longitude: foundUser.address?.location?.longitude || ''
            }
          });
          setBackendMessage('Connected to backend user data successfully.');
        }
      } catch (error) {
        console.error('User fetch error:', error);
      }
    };

    const fetchPartnerData = async () => {
      if (!storedPartnerEmail) return;
      try {
        const partnerResponse = await axios.get(`${API_BASE}/api/delivery-partners?email=${encodeURIComponent(storedPartnerEmail)}&limit=1`);
        const foundPartner = Array.isArray(partnerResponse.data) && partnerResponse.data.length > 0
          ? partnerResponse.data[0]
          : null;
        if (foundPartner) {
          setPartner(foundPartner);
          setBackendMessage('Connected to backend delivery partner data successfully.');
        }
      } catch (error) {
        console.error('Partner fetch error:', error);
      }
    };

    fetchUserData();
    fetchPartnerData();
  }, [API_BASE]);

  useEffect(() => {
    const fetchBackendDetails = async () => {
      try {
        if (user?._id) {
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
        }

        if (partner?._id) {
          const partnerOrdersResponse = await axios.get(`${API_BASE}/api/orders?deliveryPartner=${partner._id}`);
          if (Array.isArray(partnerOrdersResponse.data)) {
            setOrders(partnerOrdersResponse.data);
          }
        }
      } catch (error) {
        console.error('Backend details error:', error);
      }
    };

    fetchBackendDetails();
  }, [API_BASE, user, partner]);

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

  const saveUserInLocalStorage = (userData) => {
    localStorage.setItem('sevzoUserEmail', userData.email);
    localStorage.removeItem('sevzoPartnerEmail');
  };

  const savePartnerInLocalStorage = (partnerData) => {
    localStorage.setItem('sevzoPartnerEmail', partnerData.email);
    localStorage.removeItem('sevzoUserEmail');
  };

  const handleSignOut = () => {
    setUser(null);
    setPartner(null);
    setAuthError('');
    localStorage.removeItem('sevzoUserEmail');
    localStorage.removeItem('sevzoPartnerEmail');
    setBackendMessage('Signed out successfully.');
    setCurrentTab('Home');
  };

  const handleAuthSubmit = async () => {
    setAuthError('');
    const payload = {
      email: authEmail,
      password: authPassword
    };

    if (authMode === 'register') {
      payload.name = authName;
      payload.phone = authPhone;
      if (authType === 'delivery') {
        payload.vehicleType = authVehicle;
      }
    }

    try {
      if (authType === 'user') {
        if (authMode === 'login') {
          const response = await axios.post(`${API_BASE}/api/users/login`, payload);
          setUser(response.data);
          saveUserInLocalStorage(response.data);
          setBackendMessage('User signed in successfully.');
        } else {
          const response = await axios.post(`${API_BASE}/api/users`, payload);
          setUser(response.data);
          saveUserInLocalStorage(response.data);
          setBackendMessage('User registered successfully.');
        }
      } else {
        if (authMode === 'login') {
          const response = await axios.post(`${API_BASE}/api/delivery-partners/login`, payload);
          setPartner(response.data);
          savePartnerInLocalStorage(response.data);
          setBackendMessage('Delivery partner signed in successfully.');
        } else {
          const response = await axios.post(`${API_BASE}/api/delivery-partners`, {
            ...payload,
            name: authName,
            phone: authPhone,
            vehicleType: authVehicle
          });
          setPartner(response.data);
          savePartnerInLocalStorage(response.data);
          setBackendMessage('Delivery partner registered successfully.');
        }
      }
      setCurrentTab('Home');
      setAuthMode('login');
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      setAuthPhone('');
      setAuthVehicle('');
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError(error?.response?.data?.error || 'Authentication failed.');
    }
  };

  const handleProfileSave = async () => {
    try {
      if (!user) return;
      const payload = {
        name: user.name,
        phone: user.phone,
        address: {
          line1: profileAddress.line1,
          line2: profileAddress.line2,
          city: profileAddress.city,
          state: profileAddress.state,
          postalCode: profileAddress.postalCode,
          country: profileAddress.country,
          location: {
            latitude: profileAddress.location.latitude,
            longitude: profileAddress.location.longitude
          }
        }
      };
      const response = await axios.put(`${API_BASE}/api/users/${user._id}`, payload);
      setUser(response.data);
      setOrderConfirmationMessage('Profile saved successfully.');
      setBackendMessage('Profile updated in backend.');
    } catch (error) {
      console.error('Profile save error:', error);
      setAuthError('Unable to save profile.');
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setAuthError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfileAddress((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
        setAuthError('GPS location captured. Save your profile to store it.');
      },
      () => {
        setAuthError('Unable to capture GPS location. Please allow location access.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePayWithPhonePe = async () => {
    if (!user) {
      setAuthError('Please sign in as a user to place an order.');
      setCurrentTab('Account');
      return;
    }
    if (!cart.length) {
      setAuthError('Your cart is empty. Add items before checkout.');
      return;
    }
    if (!profileAddress.line1) {
      setAuthError('Add a delivery address before checkout.');
      setCurrentTab('Account');
      return;
    }

    try {
      const deliveryPin = `${Math.floor(1000 + Math.random() * 9000)}`;
      const orderPayload = {
        orderNumber: `MDG${Date.now()}`,
        user: user._id,
        items: cart.map((item) => ({ inventory: item.id, name: item.name, quantity: item.qty, price: item.price, total: item.price * item.qty })),
        totalAmount: cartTotalAmount,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'confirmed',
        deliveryPin,
        shippingAddress: {
          line1: profileAddress.line1,
          line2: profileAddress.line2,
          city: profileAddress.city,
          state: profileAddress.state,
          postalCode: profileAddress.postalCode,
          country: profileAddress.country
        }
      };

      const response = await axios.post(`${API_BASE}/api/orders`, orderPayload);
      const newOrder = response.data;
      setOrders((prev) => [newOrder, ...prev]);
      setTrackingOrder(newOrder);
      setOrderConfirmationMessage(`Order created. Pay on PhonePe using my1504@ybl and confirm delivery with PIN ${deliveryPin}.`);
      setCart([]);
      setIsCheckoutOpen(false);

      window.open(`upi://pay?pa=my1504@ybl&pn=Mandigo&am=${cartTotalAmount}&cu=INR&tn=Mandigo+Order`, '_blank');
    } catch (error) {
      console.error('Payment error:', error);
      setAuthError('Unable to create order at this time.');
    }
  };

  const handleOrderTrack = (order) => {
    setTrackingOrder(order);
    setCurrentTab('Orders');
  };

  const handleConfirmDeliveryPin = async () => {
    if (!trackingOrder) return;
    if (deliveryPinInput !== trackingOrder.deliveryPin) {
      setAuthError('Delivery PIN does not match.');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE}/api/orders/${trackingOrder._id}`, {
        orderStatus: 'delivered',
        deliveryConfirmed: true
      });
      setTrackingOrder(response.data);
      setOrders((prev) => prev.map((order) => order._id === response.data._id ? response.data : order));
      setOrderConfirmationMessage('Delivery confirmed. Thank you!');
      setDeliveryPinInput('');
    } catch (error) {
      console.error('Delivery confirm error:', error);
      setAuthError('Unable to confirm delivery pin.');
    }
  };

  const openProductDetail = async (product) => {
    try {
      const response = await axios.get(`${API_BASE}/api/inventory/${product.id}`);
      const item = response.data;
      if (!item) return;
      setSelectedProduct({
        id: item._id,
        name: item.productName || item.name || 'Unnamed Item',
        price: item.price || item.cost || 0,
        description: item.description || 'No description available.',
        images: item.images?.length > 0 ? item.images : [item.image || item.image_url || item.photo || item.photo_url || ''],
        category: item.category || 'General',
        stock: item.stock,
        sku: item.sku,
        vendor: item.vendor,
        raw: item
      });
      if (isAdminAuthenticated) {
        setProductEditData({
          description: item.description || '',
          images: [...Array(5)].map((_, index) => item.images?.[index] || '')
        });
      }
    } catch (error) {
      console.error('Detail load error:', error);
      setBackendMessage('Unable to load product details.');
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
    const accountName = user?.name || partner?.name || 'Guest';
    const locationText = profileAddress.city ? `${profileAddress.city}${profileAddress.postalCode ? ' • ' + profileAddress.postalCode : ''}` : 'Jaipur, Rajasthan';
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const categoryOptions = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

    return (
      <div className="home-shell">
        <div className="top-header hero-card">
          <div className="header-row">
            <div className="location">
              <h2>Delivery in 10 mins</h2>
              <p>{locationText}</p>
            </div>
            <div className="header-actions">
              <div className="wallet-badge"><i className="fas fa-wallet"></i> ₹{wallet?.balance ?? 50}.00</div>
              <button className="account-chip" onClick={() => { setSelectedProduct(null); setCurrentTab('Account'); }}>
                <i className="fas fa-user-circle"></i> {accountName.split(' ')[0]}
              </button>
            </div>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search Tomatoes, Atta, Milk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="notification-banner">{promoMessage}</div>
          </div>

          <div className="category-section">
          <h3 className="section-title">Grocery & Kitchen</h3>
          <div className="cat-scroll-container">
            {categoryOptions.map((category, index) => (
              <div
                key={`${category}-${index}`}
                className={`cat-box ${activeCat === category ? 'active' : ''}`}
                onClick={() => { setActiveCat(category); setSearchQuery(''); }}
              >
                <div className="cat-img-wrapper" style={{ background: index === 0 ? '#f3f4f6' : '#eef2ff' }}>
                  <img src={index === 0 ? 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' : 'https://cdn-icons-png.flaticon.com/512/3124/3124423.png'} alt={category} />
                </div>
                <span>{category}</span>
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
                <div key={p.id} className="product-card animated-card">
                  <div onClick={() => openProductDetail(p)} style={{ cursor: 'pointer' }}>
                    <img src={mainImage} alt={p.name} onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/878/878052.png'; }} />
                    <h4>{p.name}</h4>
                  </div>
                  <div className="price-row" style={{ alignItems: 'center' }}>
                    <span className="price">₹{p.price}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="add-btn" onClick={() => addToCart(p)}>ADD</button>
                      <button className="detail-btn" onClick={() => openProductDetail(p)}>View</button>
                    </div>
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
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="page-shell">
      <h2 className="page-title">Your Cart</h2>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#9ca3af' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" style={{ width: '100px', opacity: 0.5, marginBottom: '15px' }} alt="Empty Cart" />
          <p style={{ fontWeight: '600', fontSize: '16px' }}>Your cart is empty</p>
          <p style={{ fontSize: '12px', marginTop: '5px' }}>Add items from home page to start shopping.</p>
        </div>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '5px' }}>{item.name}</h4>
                <p style={{ color: '#ff005c', fontWeight: '800', fontSize: '14px' }}>₹{item.price} x {item.qty}</p>
              </div>
              <div style={{ fontWeight: '800', fontSize: '16px' }}>₹{item.price * item.qty}</div>
            </div>
          ))}

          <div className="cart-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '600' }}><span>Item Total</span><span>₹{cartTotalAmount}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '600' }}><span>Delivery Fee</span><span style={{ color: '#10b981' }}>FREE</span></div>
            <hr style={{ border: 0, borderTop: '1px dashed #e5e7eb', margin: '15px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px' }}><span>Grand Total</span><span>₹{cartTotalAmount}</span></div>
          </div>

          <div className="checkout-card">
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>PhonePe Payment</div>
            <div style={{ fontSize: '14px', color: '#4b5563' }}>Use UPI ID <strong>my1504@ybl</strong> to complete payment from PhonePe. Tap continue to place the order and open PhonePe.</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <span style={{ fontWeight: '700' }}>UPI ID</span>
              <span style={{ color: '#111' }}>my1504@ybl</span>
            </div>
          </div>

          <button
            onClick={handlePayWithPhonePe}
            style={{ width: '100%', background: '#0e6efc', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', border: 'none', marginTop: '20px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(14,110,252,0.25)' }}
          >
            Pay with PhonePe ₹{cartTotalAmount}
          </button>

          {orderConfirmationMessage && (
            <div style={{ marginTop: '16px', padding: '14px', background: '#ecfdf5', borderRadius: '14px', color: '#065f46', fontWeight: '700' }}>
              {orderConfirmationMessage}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderOrders = () => {
    const mapSource = trackingOrder?.deliveryPartner?.currentLocation?.latitude && trackingOrder?.deliveryPartner?.currentLocation?.longitude
      ? `https://maps.google.com/maps?q=${trackingOrder.deliveryPartner.currentLocation.latitude},${trackingOrder.deliveryPartner.currentLocation.longitude}&z=15&output=embed`
      : trackingOrder?.shippingAddress?.city
        ? `https://maps.google.com/maps?q=${encodeURIComponent(`${trackingOrder.shippingAddress.line1}, ${trackingOrder.shippingAddress.city}, ${trackingOrder.shippingAddress.state}`)}&z=15&output=embed`
        : '';

    return (
      <div className="page-shell">
        <h2 className="page-title">{partner ? 'Delivery Dashboard' : 'My Orders'}</h2>

        {authError && (
          <div style={{ marginBottom: '14px', padding: '14px', background: '#fee2e2', borderRadius: '14px', color: '#b91c1c', fontWeight: '700' }}>{authError}</div>
        )}

        {trackingOrder && (
          <div className="order-card">
            <div style={{ fontWeight: '800', marginBottom: '10px' }}>Tracking Order #{trackingOrder.orderNumber}</div>
            <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>{trackingOrder.orderStatus.toUpperCase()} • ₹{trackingOrder.totalAmount}</div>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
              {trackingOrder.items?.map(item => (
                <div key={item._id || item.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.quantity} x {item.name}</span>
                  <span style={{ fontWeight: '700' }}>₹{item.total}</span>
                </div>
              ))}
            </div>
            {mapSource ? (
              <iframe
                title="Delivery map"
                src={mapSource}
                style={{ width: '100%', height: '200px', border: '0', borderRadius: '16px', marginBottom: '12px' }}
              />
            ) : (
              <div style={{ padding: '14px', background: '#f3f4f6', borderRadius: '14px', marginBottom: '12px' }}>Track delivery using the address or partner location once the order is live.</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <strong>Delivery PIN</strong>
                <div style={{ marginTop: '6px', color: '#6b7280' }}>{trackingOrder.deliveryPin || 'Not generated'}</div>
              </div>
              <div style={{ flex: 1 }}>
                <strong>Address</strong>
                <div style={{ marginTop: '6px', color: '#6b7280' }}>{trackingOrder.shippingAddress?.line1}</div>
              </div>
            </div>
            {!trackingOrder.deliveryConfirmed && trackingOrder.deliveryPin && (
              <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
                <input
                  value={deliveryPinInput}
                  onChange={(e) => setDeliveryPinInput(e.target.value)}
                  placeholder="Enter delivery PIN"
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #d1d5db' }}
                />
                <button onClick={handleConfirmDeliveryPin} style={{ width: '100%', background: '#10b981', color: '#fff', padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
                  Confirm Delivery
                </button>
              </div>
            )}
          </div>
        )}

        {useBackend ? (
          orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="order-card">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleOrderTrack(order)} style={{ background: '#0e6efc', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', fontWeight: '700' }}>
                    Track on Map
                  </button>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>{order.deliveryPin ? `PIN available` : 'PIN will be generated at checkout'}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', marginTop: '80px', color: '#9ca3af' }}>
              <img src="https://cdn-icons-png.flaticon.com/512/3500/3500833.png" style={{ width: '70px', marginBottom: '20px', opacity: 0.8 }} alt="Orders" />
              <p style={{ fontWeight: '700' }}>{partner ? 'No assigned deliveries yet' : 'No orders found'}</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>{partner ? 'Your delivery tasks will appear once orders are assigned.' : 'Your past orders will appear here when backend is connected.'}</p>
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
  };

  const saveProductEdits = async () => {
    if (!selectedProduct?.raw?._id) return;
    if (!isAdminAuthenticated) {
      setAuthError('Admin login required to save product updates.');
      return;
    }

    try {
      const payload = {
        description: productEditData.description,
        images: productEditData.images.filter(Boolean)
      };
      const response = await axios.put(`${API_BASE}/api/inventory/${selectedProduct.raw._id}`, payload, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      setSelectedProduct((prev) => ({
        ...prev,
        description: response.data.description,
        images: response.data.images || prev.images
      }));
      setBackendMessage('Product updated successfully.');
      fetchAdminData();
    } catch (error) {
      console.error('Product update error:', error);
      setAuthError('Unable to save product details.');
    }
  };

  const renderProductDetail = () => (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <button onClick={() => setSelectedProduct(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '14px', padding: '12px 16px', cursor: 'pointer', marginBottom: '20px', fontWeight: '700' }}>
        ← Back to catalog
      </button>

      <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '18px', flexDirection: 'column' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
            <img src={selectedProduct.images[0] || 'https://cdn-icons-png.flaticon.com/512/878/878052.png'} alt={selectedProduct.name} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {selectedProduct.images.map((src, index) => (
              <img
                key={index}
                src={src || 'https://cdn-icons-png.flaticon.com/512/878/878052.png'}
                alt={`Thumbnail ${index + 1}`}
                style={{ width: '70px', height: '70px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0, border: src ? '2px solid #ff005c' : '1px solid #e5e7eb' }}
              />
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>{selectedProduct.name}</h2>
                <p style={{ margin: '8px 0 0', color: '#6b7280' }}>SKU: {selectedProduct.sku || 'N/A'} • Category: {selectedProduct.category}</p>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>₹{selectedProduct.price}</div>
            </div>
            <p style={{ color: '#4b5563', lineHeight: '1.8' }}>{selectedProduct.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '18px' }}>
            <button onClick={() => addToCart(selectedProduct)} style={{ width: '100%', background: '#ff005c', color: '#fff', padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
              Add to cart
            </button>
            <button onClick={handlePayWithPhonePe} style={{ width: '100%', background: '#0e6efc', color: '#fff', padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
              Buy with PhonePe
            </button>
          </div>

          {isAdminAuthenticated && (
            <div style={{ marginTop: '24px', background: '#f8fafc', borderRadius: '20px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '14px', fontWeight: '800', fontSize: '16px' }}>Admin Edit</div>
              <textarea
                value={productEditData.description}
                onChange={(e) => setProductEditData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Edit product description"
                style={{ width: '100%', minHeight: '120px', padding: '14px', borderRadius: '16px', border: '1px solid #d1d5db', marginBottom: '14px', resize: 'vertical' }}
              />
              <div style={{ display: 'grid', gap: '12px', marginBottom: '14px' }}>
                {productEditData.images.map((value, index) => (
                  <input
                    key={index}
                    value={value}
                    onChange={(e) => setProductEditData((prev) => {
                      const images = [...prev.images];
                      images[index] = e.target.value;
                      return { ...prev, images };
                    })}
                    placeholder={`Photo URL ${index + 1}`}
                    style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #d1d5db' }}
                  />
                ))}
              </div>
              <button onClick={saveProductEdits} style={{ width: '100%', background: '#111827', color: '#fff', padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
                Save product details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccount = () => {
    const accountName = user?.name || partner?.name || 'Guest';
    const accountEmail = user?.email || partner?.email || 'guest@sevzo.app';
    const accountRole = user ? 'User' : partner ? 'Delivery Partner' : 'Guest';

    if (!user && !partner) {
      return (
        <div className="page-shell">
          <div className="panel-card welcome-card">
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px' }}>Welcome to Mandigo</h2>
            <p style={{ color: '#4b5563', lineHeight: '1.7' }}>Sign in or register as a user or delivery partner to access orders, tracking, and GPS-enabled address management.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setAuthType('user')}
              style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: authType === 'user' ? '#ff005c' : '#f3f4f6', color: authType === 'user' ? '#fff' : '#111', fontWeight: 700 }}
            >
              User
            </button>
            <button
              onClick={() => setAuthType('delivery')}
              style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: authType === 'delivery' ? '#ff005c' : '#f3f4f6', color: authType === 'delivery' ? '#fff' : '#111', fontWeight: 700 }}
            >
              Delivery Partner
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>{authType === 'user' ? 'Customer account' : 'Delivery partner account'}</div>
              </div>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', color: '#111', fontWeight: 700 }}
              >
                {authMode === 'login' ? 'Register' : 'Login'}
              </button>
            </div>

            {authMode === 'register' && (
              <input
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder="Full name"
                style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '12px' }}
              />
            )}
            <input
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '12px' }}
            />
            <input
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Password"
              type="password"
              style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '12px' }}
            />
            {authMode === 'register' && (
              <>
                <input
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  placeholder="Phone number"
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '12px' }}
                />
                {authType === 'delivery' && (
                  <input
                    value={authVehicle}
                    onChange={(e) => setAuthVehicle(e.target.value)}
                    placeholder="Vehicle type"
                    style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '12px' }}
                  />
                )}
              </>
            )}

            {authError && <div style={{ marginBottom: '12px', color: '#b91c1c', fontWeight: '700' }}>{authError}</div>}

            <button
              onClick={handleAuthSubmit}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', color: '#fff', background: '#111827', fontWeight: '800', cursor: 'pointer' }}
            >
              {authMode === 'login' ? 'Sign In' : `Register ${authType === 'delivery' ? 'Partner' : 'User'}`}
            </button>
          </div>

          <div style={{ marginTop: '20px', background: '#fff', borderRadius: '20px', padding: '16px', color: '#4b5563', lineHeight: '1.7', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <strong>Payment UPI</strong>
            <p style={{ marginTop: '8px' }}>Use PhonePe UPI ID <strong>my1504@ybl</strong> for secure checkout.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="page-shell">
        <div className="account-summary-card panel-card">
          <div className="profile-avatar">👤</div>
          <div>
            <h2>{accountName}</h2>
            <p className="muted-text">{accountEmail}</p>
            <p className="muted-text">{accountRole}</p>
          </div>
        </div>

        {user && (
          <>
            <div className="panel-card wallet-card">
              <div className="section-label">Wallet Balance</div>
              <div className="wallet-amount">₹{wallet?.balance ?? 0}</div>
              <p className="muted-text">{wallet ? wallet.transactions?.length + ' transactions' : 'Connect backend to show wallet transactions.'}</p>
            </div>

            <div className="panel-card form-card">
              <div className="section-label">Delivery Address</div>
              <div className="form-grid">
                <input
                  value={profileAddress.line1}
                  onChange={(e) => setProfileAddress((prev) => ({ ...prev, line1: e.target.value }))}
                  placeholder="Address line 1"
                  className="form-input"
                />
                <input
                  value={profileAddress.line2}
                  onChange={(e) => setProfileAddress((prev) => ({ ...prev, line2: e.target.value }))}
                  placeholder="Address line 2"
                  className="form-input"
                />
                <input
                  value={profileAddress.city}
                  onChange={(e) => setProfileAddress((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="form-input"
                />
                <input
                  value={profileAddress.state}
                  onChange={(e) => setProfileAddress((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  className="form-input"
                />
                <input
                  value={profileAddress.postalCode}
                  onChange={(e) => setProfileAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Postal code"
                  className="form-input"
                />
                <input
                  value={profileAddress.country}
                  onChange={(e) => setProfileAddress((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                  className="form-input"
                />
                <input
                  value={profileAddress.location.latitude}
                  readOnly
                  placeholder="Latitude"
                  className="form-input"
                />
                <input
                  value={profileAddress.location.longitude}
                  readOnly
                  placeholder="Longitude"
                  className="form-input"
                />
              </div>
              <div className="button-row">
                <button onClick={captureLocation} className="secondary-button">Capture GPS</button>
                <button onClick={handleProfileSave} className="primary-button">Save Profile</button>
              </div>
            </div>
          </>
        )}

        {partner && (
          <div className="panel-card form-card">
            <div className="section-label">Delivery Partner Status</div>
            <div className="form-grid">
              <div className="form-note"><strong>Vehicle:</strong> {partner.vehicleType || 'Not specified'}</div>
              <div className="form-note"><strong>Availability:</strong> {partner.isAvailable ? 'Available' : 'Not available'}</div>
              <div className="form-note"><strong>Current GPS:</strong> {partner.currentLocation?.latitude ? `${partner.currentLocation.latitude.toFixed(4)}, ${partner.currentLocation.longitude.toFixed(4)}` : 'Not set'}</div>
            </div>
            <button onClick={handleSignOut} className="primary-button" style={{ marginTop: '16px' }}>
              Sign Out Partner
            </button>
          </div>
        )}

        <div className="panel-card action-card">
          <div className="section-label">Quick Actions</div>
          <div className="button-grid">
            <button onClick={() => setCurrentTab('Orders')} className="secondary-button">View your orders</button>
            <button onClick={() => setCurrentTab('Home')} className="secondary-button">Browse inventory</button>
            <button onClick={handleSignOut} className="primary-button">Sign Out</button>
          </div>

          <div className="panel-note">
            {backendMessage}
          </div>
        </div>
      </div>
    );
  };

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
        {selectedProduct ? renderProductDetail() : (
          <>
            {currentTab === 'Home' && renderHome()}
            {currentTab === 'Cart' && renderCart()}
            {currentTab === 'Orders' && renderOrders()}
            {currentTab === 'Account' && renderAccount()}
            {currentTab === 'Admin' && renderAdmin()}
          </>
        )}
      </div>

      <div className="bottom-nav">
        <div className={`nav-item ${currentTab === 'Home' ? 'active' : ''}`} onClick={() => { setSelectedProduct(null); setCurrentTab('Home'); }}>
          <i className="fas fa-home"></i>Home
        </div>
        <div className={`nav-item ${currentTab === 'Orders' ? 'active' : ''}`} onClick={() => { setSelectedProduct(null); setCurrentTab('Orders'); }}>
          <i className="fas fa-receipt"></i>Orders
        </div>
        <div className={`nav-item ${currentTab === 'Cart' ? 'active' : ''}`} onClick={() => { setSelectedProduct(null); setCurrentTab('Cart'); }} style={{ position: 'relative' }}>
          <i className="fas fa-shopping-cart"></i>Cart
          {cartTotalItems > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '15px', background: '#ff005c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', border: '2px solid white' }}>
              {cartTotalItems}
            </span>
          )}
        </div>
        <div className={`nav-item ${currentTab === 'Account' ? 'active' : ''}`} onClick={() => { setSelectedProduct(null); setCurrentTab('Account'); }}>
          <i className="fas fa-user"></i>Account
        </div>
        <div className={`nav-item ${currentTab === 'Admin' ? 'active' : ''}`} onClick={() => {
          setSelectedProduct(null);
          if (isAdminAuthenticated) {
            setCurrentTab('Admin');
          } else {
            setShowAdminLoginModal(true);
          }
        }}>
          <i className="fas fa-shield-alt"></i>Admin
        </div>
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