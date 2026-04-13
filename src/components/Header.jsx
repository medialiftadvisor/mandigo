export default function Header({ searchQuery, setSearchQuery }) {
  return (
    <div className="top-header">
      <div className="header-content">
        <div className="location-info">
          <h2>Delivery in 15 minutes</h2>
          <p>Jaipur, Rajasthan 302020 <i className="fas fa-caret-down"></i></p>
        </div>
        <div className="wallet-badge">₹ 50.00</div>
      </div>
      <div className="search-box">
        <i className="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}