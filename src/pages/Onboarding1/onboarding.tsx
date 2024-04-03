import React from "react";
import styles from "./onb.module.css";
export default function onboarding() {
  return (
    <div className={styles.container}>
      <div className={styles.onb}>
        <img src="/images/Address11.jpg" alt="" className="img1" />
      </div>
      <br />
      
      <div className={styles.onb2}>
        <p className={styles.onp2}>All you need <br />from wholesaler in one platform</p>
      </div>
      <br />
      <div className={styles.onb3}>
        <p className={styles.onp3}>
          we combine many wholesalers and warehouses <br /> in one platform to be easy
          and more fast to you
        </p>
      </div>

      
      <div className={styles.Btonb3}>
      <button className={styles.Obtn1} onClick={() => { window.location.href = '../Onboarding2/onboarding2' }}>Next</button>
        
        <button className={styles.Obtn2}>Skip</button>
      </div>
    </div>
  );
}
