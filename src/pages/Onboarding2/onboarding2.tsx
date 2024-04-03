import React, { useState } from "react";
import styles from "../Onboarding1/onb.module.css";
import { AuthDrawer } from "@/components/auth-drawer";

export default function Onboarding() {
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.onb}>
        <img src="/images/Delivering1.png" alt="" className="img2" />
      </div>
      <br />

      <div className={styles.onb2}>
        <p className={styles.onp2}>
          Your lovely products <br />
          but with less prices for U!
        </p>
      </div>
      <br />
      <div className={styles.onb3}>
        <p className={styles.onb3}>
          we try to make the experience fully active so <br />
          the deal is to cut the prices from wholesalers <br />
          to the best
        </p>
      </div>

      <div className={styles.Btonb3}>
        <button
          className={styles.Obtn1}
          onClick={() => {
            setIsCreateAccountOpen(true);
          }}
        >
          Create Account
        </button>

        <button className={styles.Obtn2}>Skip</button>
      </div>

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
