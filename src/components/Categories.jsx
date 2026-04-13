const cats = [
  { name: 'Vegetables & Fruits', img: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png', bg: '#e8f5e9' },
  { name: 'Atta, Rice & Dal', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082011.png', bg: '#f1f8e9' },
  { name: 'Oil, Ghee & Masala', img: 'https://cdn-icons-png.flaticon.com/512/3348/3348084.png', bg: '#fff8e1' },
  { name: 'Dairy & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050114.png', bg: '#e3f2fd' },
  { name: 'Bakery', img: 'https://cdn-icons-png.flaticon.com/512/2661/2661338.png', bg: '#fce4ec' }
];

export default function Categories({ activeCat, setActiveCat }) {
  return (
    <div style={{ padding: '15px 0' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '800', padding: '0 16px', marginBottom: '12px' }}>
        Grocery & Kitchen
      </h3>
      
      {/* Scrollable Container */}
      <div className="cat-scroll-container" style={{ 
        display: 'flex', 
        gap: '12px', 
        overflowX: 'auto', 
        padding: '0 16px',
        scrollbarWidth: 'none' 
      }}>
        {cats.map((c, i) => (
          <div 
            key={i} 
            className={`cat-box ${activeCat === c.name ? 'active' : ''}`}
            onClick={() => setActiveCat(c.name)}
            style={{ textAlign: 'center', flexShrink: 0, cursor: 'pointer' }}
          >
            <div className="cat-img-wrapper" style={{ 
              background: c.bg, 
              width: '75px', 
              height: '75px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: activeCat === c.name ? '2px solid #ff005c' : '1px solid transparent'
            }}>
              <img src={c.img} alt={c.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
            </div>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              display: 'block', 
              marginTop: '6px',
              color: activeCat === c.name ? '#ff005c' : '#333',
              width: '75px',
              lineHeight: '1.2'
            }}>
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}