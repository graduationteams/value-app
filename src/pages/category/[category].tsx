import React, { useState } from "react";
import styles from "./Household.module.css";

import ProductCard from "~/components/productcard/productcard";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

export default function Household() {
  const router = useRouter();

  const { category } = router.query;

  const [selectedSubcategory, setSelectedSubcategory] = useState<
    string | undefined
  >();

  const products = api.products.getBySubcategory.useQuery({
    categoryName: category as string,
    subcategoryId: selectedSubcategory,
  });

  const subcategories = api.categories.subcategory.useQuery({
    categoryName: category as string,
  });

  const handleButtonClick = (subcategoryId: string | undefined = undefined) => {
    setSelectedSubcategory(subcategoryId);
  };

  return (
    <>
      <div className={styles.header}>
        <br />
        <br />
        <button
          onClick={() => {
            router.back();
          }}
        >
          <img src="/assets/icons/back.png" alt="" />
        </button>
        <br />
        <br />
        <h1>{category}</h1>
        <div className={styles.categoriesContainer}>
          <div className={styles.scrollablewrapper}>
            <div className={styles.categories}>
              <button
                className={`${styles.categoryButton} ${
                  selectedSubcategory === undefined ? styles.selected : ""
                }`}
                onClick={() => handleButtonClick()}
              >
                all
              </button>
              {subcategories.data?.map((subcategory) => (
                <button
                  key={subcategory.id}
                  className={`${styles.categoryButton} ${
                    selectedSubcategory === subcategory.id
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() => handleButtonClick(subcategory.id)}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
          <br />
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.productCardsContainer}>
          {products.data?.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              productName={product.name}
              Price={product.price}
              productImages={product.images.map((image) => image.url) ?? []}
              AdditionalInfo={product.description
                .split(" ")
                .slice(0, 5)
                .join(" ")}
              storeName={product.Store.name}
              StoreLogo={product.Store.Logo}
            />
          ))}
        </div>
      </div>
    </>
  );
}
