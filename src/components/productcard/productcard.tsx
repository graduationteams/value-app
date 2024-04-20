import React, { useState } from "react";
import { MyDrawer } from "../Bottomsheet/bottomsheet";
import Styles from "./productcard.module.css";
import useEmblaCarousel from "embla-carousel-react";
import { Progress } from "../ui/progress";
import { formatDistance, formatRelative } from "date-fns";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

function ProductCard({
  id,
  storeName,
  productName,
  productImages,
  AdditionalInfo,
  Price,
  StoreLogo,
  groupBuyCurrentOrders,
  groupBuyEndDateTime,
  groupBuyRequiredOrders,
  isGroupBuying = false,
}: {
  id: string;
  storeName: string;
  productName: string;
  productImages: string[];
  AdditionalInfo: string;
  Price: number;
  StoreLogo: string;
  isGroupBuying?: boolean;
  groupBuyCurrentOrders?: number | undefined;
  groupBuyEndDateTime?: Date;
  groupBuyRequiredOrders?: number;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const utils = api.useUtils();

  const session = useSession();

  const cart = api.cart.get.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  const addToCart = api.cart.add.useMutation({
    onSettled: () => {
      void cart.refetch();
    },
    onMutate: async (productId) => {
      const prev = utils.cart.get.getData();
      utils.cart.get.setData(undefined, (old) => {
        const product = old?.products.find(
          (p) => p.productId === productId.productId,
        );
        if (product) {
          product.quantity = product.quantity + 1;
        } else {
          old?.products.push({
            productId: productId.productId,
            quantity: 1,
            cartId: old?.id,
            id: "fake-id",
            createdAt: new Date(),
            updatedAt: new Date(),
            //@ts-expect-error :))
            product: {} as unknown,
          });
        }

        return old;
      });
      return { prev };
    },
  });
  const decrementFromCart = api.cart.decrement.useMutation({
    onSettled: () => {
      void cart.refetch();
    },
    onMutate: async (productId) => {
      const prev = utils.cart.get.getData();
      utils.cart.get.setData(undefined, (old) => {
        if (!old) return old;
        const product = old.products.find(
          (p) => p.productId === productId.productId,
        );
        if (product) {
          product.quantity = product.quantity - 1;
          if (product.quantity === 0) {
            old.products = old?.products.filter(
              (p) => p.productId !== productId.productId,
            );
          }
        }
        return old;
      });
      return { prev };
    },
  });

  const quantity =
    cart.data?.products.find((product) => product.productId === id)?.quantity ??
    0;

  const handleTopSectionClick = () => {
    setIsDrawerOpen(true);
    void fetchRecommendations();
  };

  const handleIncrement = () => {
    if (session.status === "unauthenticated") {
      alert("must be Logged in to add to cart");
      return;
    }
    addToCart.mutate({ productId: id });
  };

  const handleDecrement = () => {
    if (session.status === "unauthenticated") {
      alert("must be Logged in to add to cart");
      return;
    }
    decrementFromCart.mutate({ productId: id });
  };

  //unvtion to fetch recommended products
  const fetchRecommendations = async () => {
    try {
      const response = await fetch(
        `https://recommendv-68e7e51ae774.herokuapp.com/recommendations/${id}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
  };

  const [emblaRef] = useEmblaCarousel({ loop: false });
  return (
    <>
      <div className="h-58 bg-white mt-auto flex w-40 flex-col items-center overflow-hidden rounded-lg font-sans shadow-lg">
        <div className="w-full cursor-pointer" onClick={handleTopSectionClick}>
          {/* Top Section: Product Image and Information */}
          <img
            className="w-full object-cover"
            src={productImages[0] ?? "https://placehold.it/200x200"}
            alt="Product"
            style={{ height: "173px" }}
          />
          <div className="flex w-full flex-col items-start px-4 pt-4">
            <div className="mb-2 text-xs text-gray-400">{storeName}</div>
            <div className="mb-1 text-sm text-gray-900">{productName}</div>
            <div className="mb-4 text-xs text-gray-400">{AdditionalInfo}</div>
            <div className="mb-3 text-xs font-bold text-blue-600">
              {Price} sar
            </div>
          </div>
          {isGroupBuying ? (
            <div className="px-4 pb-4">
              <Progress
                value={
                  ((Number(groupBuyCurrentOrders) ?? 0) /
                    (Number(groupBuyRequiredOrders) ?? 1)) *
                  100
                }
              />
              <p className="text-medium">
                Ends in&nbsp;
                {formatDistance(groupBuyEndDateTime ?? "", new Date(), {})}
              </p>
            </div>
          ) : null}
        </div>

        {/* Bottom Section: Quantity Counter */}
        <div className="w-full border-t border-dashed border-gray-200"></div>
        <div className="flex w-full items-center justify-center px-4 py-2">
          {quantity === 0 ? (
            <button
              onClick={handleIncrement}
              className="flex items-center justify-center p-1 text-xs text-gray-900"
            >
              <img
                src="/assets/icons/plus.png"
                alt="add to cart"
                className="mr-1 h-4 w-4"
              />
              <span>add to cart</span>
            </button>
          ) : (
            <div className="flex items-center justify-center">
              <button
                onClick={handleDecrement}
                className="p-1 text-xs text-gray-900"
              >
                <img
                  src="/assets/icons/minus.png"
                  alt="Decrease"
                  className="h-4 w-4"
                />
              </button>
              <span className="mx-2 text-xs">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="p-1 text-xs text-gray-900"
              >
                <img
                  src="/assets/icons/plus.png"
                  alt="Increase"
                  className="h-4 w-4"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <MyDrawer
        isOpen={isDrawerOpen}
        onclose={() => {
          setIsDrawerOpen(false);
        }}
      >
        <div className={Styles.container}>
          <img src={StoreLogo} alt="" />
          <span className={Styles.bold}>{storeName}</span>
        </div>
        <div className={Styles.content}>
          <div className="w-full">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex w-full gap-2">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className="flex w-full min-w-0 flex-shrink-0 flex-grow-0 basis-full justify-center overflow-x-hidden"
                  >
                    <img
                      src={img}
                      alt="Product"
                      className="max-h-60 max-w-60 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            <br />
            <p className={Styles.bold}>{productName}</p>
            <p className={Styles.light}>{AdditionalInfo}</p>
            <p className={Styles.bold}>{Price} SAR</p>

            <br />
            <br />
            <div className={Styles.container}>
              <div className="flex items-center justify-center gap-2 pr-4">
                <button onClick={handleDecrement}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <span className={Styles.quantity}>{quantity}</span>
                <button onClick={handleIncrement}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <button className={Styles.CartBtn}>
                <span className={Styles.IconContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 576 512"
                    fill="white"
                    className="<?= $Styles->cart ?>"
                  >
                    <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
                  </svg>
                </span>
                <p className={Styles.text}>Add to Cart</p>
              </button>
            </div>
          </div>
        </div>
      </MyDrawer>
    </>
  );
}

export default ProductCard;
