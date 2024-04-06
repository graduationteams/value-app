import React, { useState } from "react";
import styles from "../Onboarding1/onb.module.css";
import { AuthDrawer } from "@/components/auth-drawer";

export default function Onboarding() {
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  return (
    <div className={styles.container}>
    <img src="/images/Delivering1.png" alt="" className="img2" />

    <br />
    <p className={styles.title}>
          Your lovely products <br />
          but with less prices for U!
        </p>


    <br />
    <p className={styles.subtitle}>
    we try to make the experience fully active so 
    the deal is to cut the prices from wholesalers 
    to the best </p>
    <br />
    <br />

        <button
         className={styles.op1}
          onClick={() => {
            setIsCreateAccountOpen(true);
          }}
        >
          Create Account
        </button>
        <br />
        <button className={styles.op2}>Skip</button>


      <AuthDrawer
        isOpen={isCreateAccountOpen}
        onClose={() => {
          setIsCreateAccountOpen(false);
        }}
        defaultMode="sign-up"
      />
    </div>
  );
}