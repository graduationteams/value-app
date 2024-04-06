import React from "react";
import styles from "./onb.module.css"; // Assuming you have a CSS module for styling

export default function Onboarding() {
  return (
    <div className={styles.container}>
      <img src="/images/Address11.jpg" alt="" />
      <br />
      <br />
      <p className={styles.title}>
      All you need from  wholesaler in one <span className={styles.highlight}>platform</span>
      </p>
      
      <p className={styles.subtitle}>
      we combine many wholesalers and warehouses in one platform to be easy and more fast to you
      </p>
      <br />
      <br />
      <br />
      <br />
      <button className={styles.op1}>
        next
      </button>
      <br />
      <button className={styles.op2}>
        skip
      </button>
      </div>
  );
}
