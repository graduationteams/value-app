import React, { useState } from "react";
import styles from "./Household.module.css";


import ProductCard from "~/components/productcard/productcard";
import Navbar from "~/components/Navbar/Navbar";

export default function Household() {
  const [selectedButton, setSelectedButton] = useState<number>(1); // Set initial state to 1

  const handleButtonClick = (buttonId: number) => {
    setSelectedButton(buttonId);
  };


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
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>
       <ProductCard/>

      </div>
    
    </div>
  );
}
