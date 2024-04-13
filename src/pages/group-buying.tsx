import React from "react";
import styles from "./Householdsupplies/Household.module.css";

import ProductCard from "~/components/productcard/productcard";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";

export default function Household() {
  const router = useRouter();

  const products = api.product.getGroupBuy.useQuery();

  return (
    <>
      <div className={styles.header}>
        <br />
        <br />
        <button
          className="pl-2"
          onClick={() => {
            router.back();
          }}
        >
          <ChevronLeft size={32} />
        </button>
        <br />
        <br />
        <h1 className="pb-4">Household supplies </h1>
      </div>

      <div className={styles.container}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px 20px",
            paddingTop: "150px",
          }}
        >
          {products.data?.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              storeName={product.Store.name}
              productName={product.name}
              productImages={product.images.map((image) => image.url) ?? []}
              AdditionalInfo={product.description
                .split(" ")
                .slice(0, 5)
                .join(" ")}
              Price={product.price}
              StoreLogo={product.Store.Logo}
              groupBuyCurrentOrders={product.currentOrders}
              groupBuyRequiredOrders={product.required_qty ?? undefined}
              groupBuyEndDateTime={product.group_buy_end ?? undefined}
              isGroupBuying={product.is_group_buy}
            />
          ))}
        </div>
      </div>
    </>
  );
}
