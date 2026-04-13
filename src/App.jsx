import React from 'react';
import HomePage from './HomePage';

function App() {
  return (
    <div className="App">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold tracking-[0.3em] uppercase">
          Human Honor
        </div>
        <div className="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-widest">
          <a href="/" className="hover:text-gray-500 transition">Home</a>
          <a href="/shop" className="hover:text-gray-500 transition">Shop</a>
          <a href="/about" className="hover:text-gray-500 transition">Heritage</a>
        </div>
        <div className="flex items-center space-x-5">
          <button className="text-sm uppercase tracking-tighter">Search</button>
          <button className="relative">
            <span className="text-sm uppercase tracking-tighter">Cart</span>
            <span className="absolute -top-2 -right-3 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
      </nav>

      <HomePage />
      
      {/* Simple Footer */}
      <footer className="bg-gray-50 py-10 text-center border-t border-gray-200">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
          © 2026 Human Honor Lifestyle. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
