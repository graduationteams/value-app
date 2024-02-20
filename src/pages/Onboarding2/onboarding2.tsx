import React from "react";
import styles from "./onb2.module.css";
export default function onboarding() {
  return (
    <div className="container">
      <div className={styles.onb}>
        <img src="/images/Delivering1.png" alt="" className="img2" />
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
        <img src="/images/point2.png" alt="" className="img4" />
      </div>

      <div className={styles.Btonb3}>
        <button className={styles.Obtn1}>Create Account</button>
        
        <button className={styles.Obtn2}>Skip</button>
      </div>
    </div>
  );
}
