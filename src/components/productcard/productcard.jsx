import React, { useState } from 'react';
import { MyDrawer } from "../../components/Bottomsheet/bottomsheet"; 
import Styles from './productcard.module.css';
function ProductCard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const handleTopSectionClick = () => {
    setIsDrawerOpen(true);
  };

  const handleIncrement = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity(prevQuantity => prevQuantity > 0 ? prevQuantity - 1 : 0);
  };

  return (
    <div className="w-44 h-58 bg-white rounded-lg shadow-lg flex flex-col items-center overflow-hidden font-sans">
      <div className="w-full cursor-pointer" onClick={handleTopSectionClick}>
        {/* Top Section: Product Image and Information */}
        <img className="w-full object-cover" src="/assets/images/productimage.png" alt="Product" style={{ height: '173px' }} />
        <div className="px-4 pt-4 w-full flex flex-col items-start">
          <div className="text-gray-400 text-xs mb-2">almohsen</div>
          <div className="text-gray-900 text-sm mb-1">coca cola</div>
          <div className="text-gray-400 text-xs mb-4">4 kg</div>
          <div className="text-blue-600 text-xs font-bold mb-3">240 sar</div>
        </div>
      </div>
      {/* Bottom Section: Quantity Counter */}
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

      <MyDrawer
        isOpen={isDrawerOpen}
        onclose={() => {
          setIsDrawerOpen(false);
        }}
      >
<div className={Styles.container}>
  <img src="images/almohsen.png" alt="" />
  <span className={Styles.bold}>Almohsen markets • 4km</span>
</div>
<div className={Styles.content}>
  <div className={Styles.productContainer}>
    <img className="w-full object-cover" src="/assets/images/productimage.png" alt="Product" />
    <br />
    <p className={Styles.bold}>Coca-Cola 335</p>
    <p className={Styles.light}>Packaged Coca-Cola, containing 335ml each, available in packs of 12</p>
    <p className={Styles.bold}>240 SAR</p>

    <br />
    <br /><div className={Styles.container}>
  <button onClick={handleDecrement}>
    <img src="/assets/icons/minus.png" alt="Decrease"/>
  </button>
  <span className={Styles.quantity}>{quantity}</span>
  <button onClick={handleIncrement}>
    <img src="/assets/icons/plus.png" alt="Increase"/>
  </button>
  <button className={Styles.CartBtn}>
  <span className={Styles.IconContainer}> 
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" fill="white" className="<?= $Styles->cart ?>">
  <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z">
  </path>
</svg>
  </span>
  <p className={Styles.text}>Add to Cart</p>
</button>
</div>
  </div>
</div>






      </MyDrawer>
      </div>


  );
}

export default ProductCard;
