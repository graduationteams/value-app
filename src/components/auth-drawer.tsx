import React, { useState } from "react";
import styles from "../pages/Onboarding1/onb.module.css";
import MyDrawer from "./Bottomsheet/bottomsheet";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { api } from "@/utils/api";

export function AuthDrawer({
  isOpen,
  onClose,
  defaultMode = "sign-in",
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "sign-in" | "sign-up";
}) {
  const [drawerMode, setDrawerMode] = useState<"sign-in" | "sign-up">(
    defaultMode,
  );

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const signup = api.auth.register.useMutation({
    onSuccess: () => {
      onClose();
      // after registration, we should automatically sign in the user
      void signIn("credentials", {
        email: signUpEmail,
        password: signUpPassword,
      });
    },
  });

  return (
    <>
      <MyDrawer
        isOpen={isOpen}
        onclose={() => {
          onClose();
        }}
      >
        {drawerMode === "sign-up" ? (
          <div>
            <div className={styles.onb2}>
              <p className={styles.onp2}>Sign Up</p>
            </div>
            <div className={styles.onb3}>
              <p className={styles.onp3}>
                Simple, create your account to get started!
              </p>
            </div>
            <div className={styles.buttonContainer}>
              <button
                className={styles.googlebutton}
                onClick={() => {
                  void signIn("google");
                }}
              >
                <Image
                  src="/images/googlelogo.png"
                  alt="Google Logo"
                  width={24}
                  height={24}
                />
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
                <label htmlFor="name" className={styles.inputTitle}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className={styles.inputField}
                  placeholder="Enter your full name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="email" className={styles.inputTitle}>
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  className={styles.inputField}
                  placeholder="example@gmail.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="password" className={styles.inputTitle}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={styles.inputField}
                  placeholder="At least 8 characters"
                  min={8}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              className={styles.createAccount}
              onClick={() => {
                signup.mutate({
                  name: signUpName,
                  email: signUpEmail,
                  password: signUpPassword,
                });
              }}
            >
              Create Account
            </button>
            <div className={styles.signInMessage}>
              <p className={styles.onb3}>
                Already have an account?&nbsp;
                <button
                  className={styles.signInLink}
                  onClick={() => {
                    setDrawerMode("sign-in");
                  }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full px-2">
            {/* Content of the sign-in drawer */}
            <div className={styles.onb2}>
              <p className={styles.onp2}>Sign In</p>
            </div>
            <div className={styles.buttonContainer}>
              <button
                className={styles.googlebutton}
                onClick={() => {
                  void signIn("google");
                }}
              >
                <Image
                  src="/images/googlelogo.png"
                  alt="Google Logo"
                  width={24}
                  height={24}
                />
                <span className={styles.onb2}>Sign In with Google</span>
              </button>
            </div>
            <div className={styles.tst}>
              <span className={styles.line}></span>
              <span className={styles.span}>or sign in with e-mail</span>
              <span className={styles.line}></span>
            </div>
            <div className={styles.formContainer}>
              <div className={styles.inputContainer}>
                <label htmlFor="email" className={styles.inputTitle}>
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  className={styles.inputField}
                  placeholder="example@gmail.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                />
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="password" className={styles.inputTitle}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={styles.inputField}
                  placeholder="your password"
                  min={8}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              className={styles.createAccount}
              onClick={() => {
                void signIn("credentials", {
                  email: signInEmail,
                  password: signInPassword,
                });
              }}
            >
              Sign in
            </button>
            <div className={styles.signInMessage}>
              <p className={styles.onb3}>
                Not a member?
                <button
                  className={styles.signInLink}
                  onClick={() => {
                    setDrawerMode("sign-up");
                  }}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        )}
      </MyDrawer>
    </>
  );
}
