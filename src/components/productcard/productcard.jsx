import React, { useState } from 'react';

function ProductCard() {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity(prevQuantity => prevQuantity > 0 ? prevQuantity - 1 : 0);
  };

  return (
    <div className="w-44 h-58 bg-white rounded-lg shadow-lg flex flex-col items-center overflow-hidden font-sans">
      <img className="w-full object-cover" src="/assets/images/productimage.png" alt="Product" style={{ height: '173px' }} />
      <div className="px-4 pt-4 w-full flex flex-col items-start">
        <div className="text-gray-400 text-xs mb-2">almohsen</div>
        <div className="text-gray-900 text-sm mb-1">coca cola</div>
        <div className="text-gray-400 text-xs mb-4">4 kg</div>
        <div className="text-blue-600 text-xs font-bold mb-3">240 sar</div>
      </div>
      <div className="border-t border-gray-200 border-dashed w-full"></div>
      <div className="flex justify-center items-center px-4 py-2 w-full">
        {quantity === 0 ? (
          <button onClick={handleIncrement} className="text-gray-900 text-xs p-1 flex items-center justify-center">
            <img src="/assets/icons/plus.png" alt="add to cart" className="w-4 h-4 mr-1" />
            <span>add to cart</span>
          </button>
        ) : (
          <div className="flex items-center justify-center">
            <button onClick={handleDecrement} className="text-gray-900 text-xs p-1">
              <img src="/assets/icons/minus.png" alt="Decrease" className="w-4 h-4" />
            </button>
            <span className="text-xs mx-2">{quantity}</span>
            <button onClick={handleIncrement} className="text-gray-900 text-xs p-1">
              <img src="/assets/icons/plus.png" alt="Increase" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;

