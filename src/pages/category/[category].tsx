import React, { useEffect, useMemo, useState } from "react";
import styles from "./Household.module.css";

import ProductCard from "~/components/productcard/productcard";
import { api, type RouterOutputs } from "@/utils/api";
import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function Household() {
  const router = useRouter();

  const { category } = router.query;

  const [selectedSubcategory, setSelectedSubcategory] = useState<
    string | undefined
  >();

  const location = useGeolocation();

  const products = api.products.getBySubcategory.useInfiniteQuery(
    {
      categoryName: category as string,
      subcategoryId: selectedSubcategory,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const subcategories = api.categories.subcategory.useQuery({
    categoryName: category as string,
  });

  const handleButtonClick = (subcategoryId: string | undefined = undefined) => {
    setSelectedSubcategory(subcategoryId);
  };

  const productsData = useMemo(
    () =>
      (products.data?.pages ?? []).reduce<
        RouterOutputs["products"]["getBySubcategory"]["products"]
      >((acc, curr) => {
        acc.push(...curr.products);

        return acc;
      }, []),
    [products.data],
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (
      inView &&
      productsData.length > 0 &&
      !products.isLoading &&
      !products.isFetchingNextPage &&
      products.hasNextPage
    ) {
      void products.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inView,
    products.hasNextPage,
    products.isFetchingNextPage,
    products.isLoading,
    productsData.length,
  ]);

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
          {productsData?.map((product) => (
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
        {productsData.length > 0 ? (
          <div className="py-8">
            <div
              ref={ref}
              className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
