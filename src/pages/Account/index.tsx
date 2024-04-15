import React, { useState } from "react";
import { MyDrawer } from "../../components/Bottomsheet/bottomsheet";
import styles from "./AccountPage.module.css";
import AdressSelector from "@/components/adress-selector";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "@/utils/api";

export default function AccountPage() {
  const [isAccountInfoDrawerOpen, setIsAccountInfoDrawerOpen] = useState(false);
  const [isAddressesDrawerOpen, setIsAddressesDrawerOpen] = useState(false);

  const handleAccountInfoClick = () => {
    setIsAccountInfoDrawerOpen(true);
  };

  const handleAddressesClick = () => {
    setIsAddressesDrawerOpen(true);
  };

  const session = useSession();

  return (
    <div className={styles.container}>
      <br />
      <br />
      <div style={{ marginRight: "240px" }}>
        <h1 className={styles.title}>Account</h1>
      </div>
      <br />
      <br />

      <div className={`${styles.rectangle} items-center`}>
        <div>
          <Image
            src={session.data?.user.image ?? "/images/pfp.png"}
            alt="profile picture"
            height={70}
            width={70}
          />
        </div>
        <div className={styles.pfp}>
          <p className={styles.profileText}>{session.data?.user.name}</p>
          <p className={styles.number}>{session.data?.user.phone}</p>
        </div>
      </div>

      <br />

      <div className={`${styles.rectangle} flex-col !p-0`}>
        <a href="#" className={styles.page} onClick={handleAccountInfoClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            fill="currentColor"
            className="bi bi-person"
            viewBox="0 0 16 16"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
          </svg>
          <h2 className={styles.h2}>Account info</h2>
        </a>
        <a href="#" className={styles.page} onClick={handleAddressesClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            fill="currentColor"
            className="bi bi-geo-alt"
            viewBox="0 0 16 16"
          >
            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
          </svg>
          <h2 className={styles.h2}>Addresses</h2>
        </a>
        <a href="#" className={styles.page}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            fill="currentColor"
            className="bi bi-info-circle"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
          </svg>
          <h2 className={styles.h2}>About Value</h2>
        </a>
        {/* Drawer for Account Info */}
        <MyDrawer
          isOpen={isAccountInfoDrawerOpen && session.status === "authenticated"}
          onclose={() => setIsAccountInfoDrawerOpen(false)}
        >
          <AccountInfoModel
            onclose={() => {
              setIsAccountInfoDrawerOpen(false);
              void session.update();
            }}
          />
        </MyDrawer>

        <AdressSelector
          isAddressesDrawerOpen={
            isAddressesDrawerOpen && session.status === "authenticated"
          }
          setIsAddressesDrawerOpen={setIsAddressesDrawerOpen}
        />
      </div>
      <br />
      {/* <div className={`${styles.rectangle} flex-col !p-0`}>
        <a href="#" className={styles.page}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            fill="currentColor"
            className="bi bi-translate"
            viewBox="0 0 16 16"
          >
            <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
            <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31" />
          </svg>
          <h2 className={styles.h2}>Language</h2>
        </a>
      </div> */}
      <br />
      <div className={styles.container2}>
        <button
          className={styles.btn}
          onClick={() => {
            void signOut();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            fill="currentColor"
            className="bi bi-power"
            viewBox="0 0 16 16"
          >
            <path d="M7.5 1v7h1V1z" />
            <path d="M3 8.812a5 5 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812" />
          </svg>
          <h2 className={styles.btn2}>Log out</h2>
        </button>
      </div>
    </div>
  );
}

function AccountInfoModel({ onclose }: { onclose: () => void }) {
  const session = useSession();

  const [name, setName] = useState(session.data?.user.name ?? "");
  const [phone, setPhone] = useState(session.data?.user.phone ?? "");

  const editAccount = api.auth.edit.useMutation({
    onSuccess: () => {
      onclose();
    },
  });

  const [image, setImage] = useState(session.data?.user.image);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  return (
    <div className={styles.drawerContent}>
      <h1 className={styles.title}>Account info</h1>
      <br />
      <form
        className="flex w-full flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match");
            return;
          }
          if (newPassword !== "" && currentPassword === "") {
            alert("Please enter your current password");
            return;
          }
          editAccount.mutate({
            profilePicture:
              image === session.data?.user.image ? undefined : image,
            name,
            phoneNumber: phone,
            currentPassword,
            newPassword,
          });
        }}
      >
        <div className={styles.imageContainer}>
          <div className="flex w-full items-center justify-center">
            <label htmlFor="file-input" className="h-16 w-16">
              <Image
                src={image ?? "/images/pfp.png"}
                alt=""
                className={styles.centeredImage}
                width={70}
                height={70}
              />
            </label>
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                  setImage(e.target?.result as string);
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </div>
        <br />
        <h2 className={styles.title2}>Full Name</h2>
        <input
          className={styles.rectangle2}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <h2 className={styles.title2}>Phone Number</h2>
        <input
          className={styles.rectangle2}
          type="tel"
          value={phone}
          minLength={10}
          maxLength={10}
          pattern="05\d{8}"
          onChange={(e) => setPhone(e.target.value)}
        />
        <br />
        <h2 className={styles.title2}>E-mail</h2>
        <input
          className={styles.rectangle2}
          type="email"
          autoComplete="email"
          value={session.data?.user.email ?? ""}
          disabled
        />
        <br />

        {session.data?.user.isPassword ? (
          <>
            <h2 className={styles.title2}>Current Password</h2>
            <input
              className={styles.rectangle2}
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <br />
            <h2 className={styles.title2}>New Password</h2>
            <input
              className={styles.rectangle2}
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <br />
            <h2 className={styles.title2}>Confirm New Password</h2>
            <input
              className={styles.rectangle2}
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <br />
          </>
        ) : null}

        <button
          type="submit"
          className="h-12 w-full rounded-3xl bg-primary-P300 text-center text-white-W50 disabled:opacity-50"
        >
          Save
        </button>
      </form>
    </div>
  );
}
