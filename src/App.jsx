import React, { useState, useEffect } from 'react';
import { fetchProducts } from './api';
import ProductCard from './components/ProductCard';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // API se products fetch karna
    const getItems = async () => {
      const data = await fetchProducts('All');
      setProducts(data);
    };
    getItems();
  }, []);

  const addToCart = (product) => {
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="app-container" style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>QuickMart Products</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px' 
      }}>
        {products.map((item) => (
          <ProductCard 
            key={item.id} 
            product={item} 
            addToCart={addToCart} 
          />
        ))}
      </div>
    </div>
  );
}

export default App;
