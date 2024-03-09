// import React from 'react';
// import styles from './ProductCard.module.css'; // Import the CSS for styling

// function ProductCard() {
//   return (
//     <div className={styles.productCard}>
//       <img className={styles.productImage} src="/assets/images/productimage.png" alt="Coca Cola" />
//       <div className={styles.productDetails}>
//         <div className={styles.productName}>almohsen</div>
//         <div className={styles.productBrand}>coca cola</div>
//         <div className={styles.productWeight}>4kg</div>
//         <div className={styles.productPrice}>
//           <span className={styles.priceValue}>240</span>
//           <span className={styles.priceCurrency}>sar</span>
//         </div>
//         <div className={styles.productAction}>
//           <button className={styles.addButton}>
//             <span className={styles.plusIcon}>+</span>
//             <span className={styles.addText}>add</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProductCard;

import React from 'react';

function ProductCard() {
  return (
    <div className="w-42 h-67 bg-white rounded-lg shadow-lg flex flex-col items-center overflow-hidden font-sans">
      <img className="w-full h-32 object-cover" src="/assets/images/productimage.png" alt="Product" />
      <div className="px-4 pt-4 w-full">
        <div className="text-gray-400 text-xs mb-2">almohsen</div>
        <div className="text-gray-900 text-sm mb-1">coca cola</div>
        <div className="text-gray-400 text-xs mb-4">4 kg</div>
        <div className="text-blue-600 text-xs font-bold mb-3">240 sar</div>
      </div>
      <div className="border-t border-gray-200 border-dashed w-full"></div>
      <div className="px-4 py-2 w-full">
        <button className="text-gray-900 text-xs p-1 flex items-center justify-center w-full">
          <span className="mr-2">+</span>
          <span>add</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
