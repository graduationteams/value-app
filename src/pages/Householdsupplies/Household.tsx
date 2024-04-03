import React, { useState } from "react";
import styles from "./Household.module.css";


import ProductCard from "~/components/productcard/productcard";
import Navbar from "~/components/Navbar/Navbar";

export default function Household() {
  const [selectedButton, setSelectedButton] = useState<number>(1); // Set initial state to 1

  const handleButtonClick = (buttonId: number) => {
    setSelectedButton(buttonId);
  };

  //This is just a test to add products to the page
  const products = [
    { id: 1, name: "Product 1", price: "$10" },
    { id: 2, name: "Product 2", price: "$20" },
    { id: 3, name: "Product 3", price: "$30" },
    { id: 4, name: "Product 4", price: "$40" },
    { id: 5, name: "Product 5", price: "$50" },
    { id: 6, name: "Product 6", price: "$60" },
    { id: 7, name: "Product 7", price: "$70" },
    { id: 8, name: "Product 8", price: "$80" },
    // Add more products as needed
  ];

  return (
  
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <br />
          <button>
            <img src="/assets/icons/back.png" alt="" />
          </button>
          <br />
          <br />
          <h1>Household supplies </h1>
        </div>


        <div className={styles.categoriesContainer}>
          <div className={styles.categories}>
            <button
              className={`${styles.categoryButton} ${
                selectedButton === 1 ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(1)}
            >
              all
            </button>
            <button
              className={`${styles.categoryButton} ${
                selectedButton === 2 ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(2)}
            >
              plastic
            </button>
            <button
              className={`${styles.categoryButton} ${
                selectedButton === 3 ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(3)}
            >
              detergent
            </button>
            <button
              className={`${styles.categoryButton} ${
                selectedButton === 4 ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(4)}
            >
              utensils
            </button>
            <button
              className={`${styles.categoryButton} ${
                selectedButton === 5 ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(5)}
            >
              Laundry
            </button>
            <button
              className={`${styles.categoryButton} ${
                selectedButton === 6 ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(6)}
            >
              outdoor
            </button>
          </div>
        </div>
        <br />
      </div>
      <div className={styles.productCardsContainer}>
        {/* Display ProductCard components in rows with two cards per row */}
        {products.map((product) => (
          <div key={product.id} className={styles.productCardWrapper}>
            <ProductCard product={product} />
          </div>
        ))}

      </div>
    
    </div>
  );
}
