export default function BottomNav({ cartCount }) {
  return (
    <div className="bottom-nav">
      <div className="nav-item active"><i className="fas fa-home"></i>Home</div>
      <div className="nav-item"><i className="fas fa-receipt"></i>Orders</div>
      <div className="nav-item" style={{ position: 'relative' }}>
        <i className="fas fa-shopping-cart"></i>Cart
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </div>
      <div className="nav-item"><i className="fas fa-user"></i>Account</div>
    </div>
  );
}