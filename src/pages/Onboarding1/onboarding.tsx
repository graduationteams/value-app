import React from "react";
import styles from "./onb.module.css";
export default function onboarding() {
  return (
    <div className="container">
      <div className={styles.onb}>
        <img src="/images/Address11.jpg" alt="" className="img1" />
      </div>
      <br />
      
      <div className={styles.onb2}>
        <p className="onp2">All you need <br />from wholesaler in one platform</p>
      </div>
      <br />
      <div className={styles.onb3}>
        <p className="onp3">
          we combine many wholesalers and warehouses <br /> in one platform to be easy
          and more fast to you
        </p>
      </div>

      <div className={styles.point}>
        <img src="/images/point1.png" alt="" className="img3" />
      </div>

      <div className={styles.Btonb3}>
        <button className={styles.Obtn1}>Next</button>
        
        <button className={styles.Obtn2}>Skip</button>
      </div>
    </div>
  );
}
