import React from "react";
import styles from '~/components/home-buttons/HomeButtons.module.css'


export default function HomeButtons() {
  return (
    <>
    <div className="container">
        <div className={styles.HHbtn}>

        <button className={styles.Hbt}> Regular</button>
        <button className={styles.Hbt}>Farms</button>
        
        </div>  


      <div className={styles.Hbtn}>
        <button className={styles.btn}>Household Supplies</button>
        <button className={styles.btn}>Food and Groceries</button>
        <button className={styles.btn}>Personal care and Hygiene</button>
        <button className={styles.btn}>Electronics and Accessories</button>
        <button className={styles.btn}>Medical supplies</button>
      </div>
    </div>
    </>
  );
}
