import React from "react";
import styles from "./Cart.module.css";
import ProductCard from "@/components/productcard/productcard";

export default function Cart() {
    return(
        <div>
            <section className={styles.header}>
                <h2>
                    Basket
                </h2>
                <button className={styles.Location}> Location <span className={styles.rotate}>&gt;</span></button>

            </section>

            <section className={styles.container}>
                <div className={styles.productCardsContainer}>
                    <ProductCard
                        AdditionalInfo="Dishwasher"
                        Price={20}
                        productName="Fairy"
                        productImages={["https://placehold.it/200x200"]}
                        StoreLogo="https://placehold.it/200x200"
                        storeName="StoreName"
                        id="1"
                    />
                    <ProductCard
                        AdditionalInfo="Dishwasher"
                        Price={20}
                        productName="Fairy"
                        productImages={["https://placehold.it/200x200"]}
                        StoreLogo="https://placehold.it/200x200"
                        storeName="StoreName"
                        id="2"
                    />
          
             
                </div>
            </section>

            <section className={styles.checkoutContainer}>
                <button className={styles.checkout}>
                    Checkout
                </button>
            </section>
        </div>
    );
}
