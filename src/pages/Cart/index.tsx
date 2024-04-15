import React, { useState } from "react";
import styles from "./Cart.module.css";
import ProductCard from "@/components/productcard/productcard";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useAdressStore } from "@/zustand/store";
import AdressSelector from "@/components/adress-selector";

export default function Cart() {
  const cart = api.cart.get.useQuery();

  const total =
    cart.data?.products.reduce(
      (prev, curr) => prev + curr.quantity * curr.product.price,
      0,
    ) ?? 0;
  const session = useSession();

  const selectedAdress = useAdressStore((state) => state.selectedAdress);

  const adress = api.address.get.useQuery(
    { id: selectedAdress ?? "" },
    {
      enabled: selectedAdress != null && session.status === "authenticated",
    },
  );

  const [openAdressSelector, setOpenAdressSelector] = useState(false);

  return (
    <div className="mb-20">
      <section className={styles.header}>
        <h2>Basket</h2>
        <div className="flex flex-col">
          <span className="text-xsmall text-black-B75">Deliver to</span>
          <button
            className="flex min-w-24 justify-center gap-2 rounded-full border border-black-B50 bg-white-W50 px-4"
            onClick={() => {
              setOpenAdressSelector(true);
            }}
          >
            {adress.data?.city} <span className={styles.rotate}>&gt;</span>
          </button>
        </div>
      </section>

      <section className={styles.container}>
        <div className={styles.productCardsContainer}>
          {cart.data?.products.map((product) => (
            <ProductCard
              key={product.product.id}
              AdditionalInfo={product.product.description
                .split(" ")
                .slice(0, 5)
                .join(" ")}
              Price={product.product.price}
              productName={product.product.name}
              productImages={product.product.images.map((w) => w.url) ?? []}
              StoreLogo={product.product.Store.Logo}
              storeName={product.product.Store.name}
              id={product.product.id}
            />
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center">
        <button className={styles.checkout}>
          Checkout&nbsp;
          {new Intl.NumberFormat("en", {
            style: "currency",
            currency: "SAR",
          })
            .format(total)
            .replace("SAR", "")
            .trim()}
          &nbsp;SAR
        </button>
      </section>
      <AdressSelector
        isAddressesDrawerOpen={openAdressSelector}
        setIsAddressesDrawerOpen={setOpenAdressSelector}
      />
    </div>
  );
}
