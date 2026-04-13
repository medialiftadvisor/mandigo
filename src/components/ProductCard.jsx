import React from 'react';

const ProductCard = ({ product, addToCart }) => {
  // Comma separated images se pehli image nikalna
  const mainImage = product.image_url ? product.image_url.split(',')[0].trim() : 'https://via.placeholder.com/150';

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <img 
        src={mainImage} 
        alt={product.name} 
        className="w-full h-32 object-contain mb-3 hover:scale-105 transition-transform"
        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
      />
      <h4 className="text-sm font-semibold text-gray-800 h-10 overflow-hidden line-clamp-2">
        {product.name}
      </h4>
      <div className="flex justify-between items-center mt-3">
        <span className="text-lg font-bold text-black">₹{product.price}</span>
        <button 
          onClick={() => addToCart(product)}
          className="px-5 py-1.5 border border-[#ff005c] text-[#ff005c] rounded-lg font-bold text-xs hover:bg-[#ff005c] hover:text-white active:scale-90 transition-all"
        >
          ADD
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
