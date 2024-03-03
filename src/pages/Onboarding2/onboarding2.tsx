import React, { useState } from "react";
import styles from "../Onboarding1/onb.module.css";
import { MyDrawer } from "../../components/Bottomsheet/bottomsheet";




export default function Onboarding() {
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  return (
    <div className="container">
      <div className={styles.onb}>
        <img src="/images/Delivering1.png" alt="" className="img2" />
      </div>
      <br />

      <div className={styles.onb2}>
        <p className="onp2">
          Your lovely products <br/>
          but with less prices for U!
        </p>
      </div>
      <br />
      <div className={styles.onb3}>
        <p className="onp3">
         we try to make the experience fully active so <br/>
          the deal is to cut the prices from wholesalers <br/>
          to the best
         </p>
      </div>

      <div className={styles.point}>
        <img src="/images/point2.png" alt="" className="img4" />
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
     
      <MyDrawer
        isOpen={isCreateAccountOpen}
        onclose={() => {
          setIsCreateAccountOpen(false);
        }}
      >
       
        <div className={styles.onb2}>
        <p className={styles.onp2}>
        sign up
        </p>
        </div>
        <div className={styles.onb3}>
        <p className={styles.onp3}>
         simple, create your acoount to get started!
        </p>
      </div>
      <div className={styles.buttonContainer}>
  <button className={styles.googlebutton}>
    <img src="/images/googlelogo.png" alt="Google Logo" />
    <span className={styles.onb2}>Sign Up with Google</span>
  </button>
</div>


<div className={styles.tst}>
      <span className={styles.line}></span>
      <span className={styles.span}>or sign up with e-mail</span>
      <span className={styles.line}></span>
    </div>

    <div className={styles.formContainer}>
  <div className={styles.inputContainer}>
    <label htmlFor="name" className={styles.inputTitle}>Full Name</label>
    <input type="text" id="name" className={styles.inputField} placeholder="Enter your full name" />
  </div>
  <div className={styles.inputContainer}>
    <label htmlFor="email" className={styles.inputTitle}>E-mail</label>
    <input type="email" id="email" className={styles.inputField} placeholder="example@gmail.com" />
  </div>
  <div className={styles.inputContainer}>
    <label htmlFor="password" className={styles.inputTitle}>Password</label>
    <input type="password" id="password" className={styles.inputField} placeholder="At least 6 characters" />
  </div>
  
</div>

<button className={styles.createAccount}>Create Account</button>
<div className={styles.signInMessage}>
  <p className={styles.onb3}>Already have an account? <a href="/signin" className={styles.signInLink}>Sign in</a></p>
</div>
        




      </MyDrawer>
    </div>
  );
}

