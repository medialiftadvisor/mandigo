const cats = [
  { name: 'Vegetables & Fruits', img: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png', bg: '#e8f5e9' },
  { name: 'Atta, Rice & Dal', img: 'https://cdn-icons-png.flaticon.com/512/3082/3082011.png', bg: '#f1f8e9' },
  { name: 'Oil, Ghee & Masala', img: 'https://cdn-icons-png.flaticon.com/512/3348/3348084.png', bg: '#fff8e1' },
  { name: 'Dairy & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050114.png', bg: '#e3f2fd' },
  { name: 'Bakery & Biscuits', img: 'https://cdn-icons-png.flaticon.com/512/2661/2661338.png', bg: '#fce4ec' }
];

export default function Categories({ setActiveCat }) {
  return (
    <div className="cat-scroll-container">
      <h3 className="section-title">Grocery & Kitchen</h3>
      <div className="cat-row" style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 20px' }}>
        {cats.map((c, i) => (
          <div key={i} className="cat-box" onClick={() => setActiveCat(c.name)} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div className="cat-img-wrapper" style={{ background: c.bg, width: '75px', height: '75px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={c.img} alt={c.name} style={{ width: '55px' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginTop: '5px' }}>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}