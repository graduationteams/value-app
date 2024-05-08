import MyDrawer from "./Bottomsheet/bottomsheet";
import styles from "../pages/Account/AccountPage.module.css";
import { useAdressStore } from "@/zustand/store";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { AddressLocator } from "./address-locator";
import { useSession } from "next-auth/react";
import { getAdress } from "@/utils/mapbox";

const AdressDescription = ({ lang, lat }: { lang: string; lat: string }) => {
  const { data: address, isLoading } = useQuery({
    queryKey: ["adresss", lang + lat],
    queryFn: async () => {
      return await getAdress(lang, lat);
    },
  });

  return (
    <p className={styles.addressDescription}>
      {isLoading ? "Loading..." : address?.features?.[0]?.place_name_ar}
    </p>
  );
};

export default function AdressSelector({
  isAddressesDrawerOpen,
  setIsAddressesDrawerOpen,
}: {
  isAddressesDrawerOpen: boolean;
  setIsAddressesDrawerOpen: (isAddressesDrawerOpen: boolean) => void;
}) {
  const session = useSession();
  const { selectedAdress, setSelectedAdress } = useAdressStore();

  const adress = api.address.userAddresses.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  const [adresslocatorOpen, setAdresslocatorOpen] = React.useState(false);
  const addAdress = api.address.create.useMutation({
    onSuccess: () => {
      setAdresslocatorOpen(false);
      void adress.refetch();
    },
  });

  return (
    <>
      <MyDrawer
        isOpen={isAddressesDrawerOpen && !adresslocatorOpen}
        onclose={() => setIsAddressesDrawerOpen(false)}
      >
        <div className={styles.drawerContent}>
          <h1 className={styles.title}>Your delivery addresses</h1>
          <div className={styles.addressList}>
            {(adress.data ?? []).map((address) => (
              <React.Fragment key={address.id}>
                <div className={styles.addressItem}>
                  <label className={styles.addressLabel}>
                    <input
                      type="checkbox"
                      checked={selectedAdress === address.id}
                      onChange={() => setSelectedAdress(address.id)}
                    />
                    <span
                      className={
                        selectedAdress === address.id
                          ? styles.selected
                          : styles.notSelected
                      }
                    >
                      {address.city}
                    </span>
                  </label>
                  <AdressDescription lang={address.lng} lat={address.lat} />
                </div>
                {/* Divider */}
                <div className={styles.tst}>
                  <div className={styles.line}></div>
                </div>
              </React.Fragment>
            ))}
            <div className={styles.addAddressContainer}>
              <button onClick={() => setAdresslocatorOpen(true)}>
                <img src="/assets/icons/Subtract.png" alt="" />
                <p className={styles.addressLabel}>Add new address</p>
              </button>
            </div>
          </div>
        </div>
      </MyDrawer>
      <AddressLocator
        isOpen={adresslocatorOpen}
        onClose={() => setAdresslocatorOpen(false)}
        onSaveAddress={(add, langLat, place) => {
          addAdress.mutate({
            city: place ?? "Unknown",
            lat: langLat[1].toString(),
            lng: langLat[0].toString(),
          });
        }}
      />
    </>
  );
}
