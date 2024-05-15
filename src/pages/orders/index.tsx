import { cn } from "@/lib/utils";
import { api, type RouterOutputs } from "@/utils/api";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

export default function Orders() {
  const orders = api.order.getUserOrders.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const Orders = useMemo(
    () =>
      (orders.data?.pages ?? []).reduce<
        RouterOutputs["order"]["getUserOrders"]["orders"]
      >((acc, curr) => {
        acc.push(...curr.orders);

        return acc;
      }, []),
    [orders.data],
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (
      inView &&
      Orders.length > 0 &&
      !orders.isLoading &&
      !orders.isFetchingNextPage &&
      orders.hasNextPage
    ) {
      void orders.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inView,
    orders.hasNextPage,
    orders.isFetchingNextPage,
    orders.isLoading,
    Orders.length,
  ]);

  return (
    <main className="mb-20 flex min-h-screen flex-col gap-3 bg-[#FAFBFC] px-5 pt-4 font-montserrat">
      <p className="pt-12 text-h3 font-bold ">Orders</p>
      {Orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
      {Orders.length > 0 ? (
        <div className="flex justify-center py-8">
          <div
            ref={ref}
            className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"
          />
        </div>
      ) : null}
    </main>
  );
}
function OrderCard({
  order,
}: {
  order: RouterOutputs["order"]["getUserOrders"]["orders"][number];
}) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex rounded-md border border-black-B50 bg-white-W50 p-4 shadow-md"
    >
      <div className="flex w-full flex-col gap-4 p-2">
        <div className="flex gap-2">
          <p className="text-nowrap text-black-B75">order Id </p>
          <p className="text-black-B200">#{order.id.slice(-10)}</p>
        </div>
        <div className="flex items-center gap-4">
          {order.productOrder.slice(0, 2).map((productOrder) => (
            <img
              key={productOrder.product.images[0]?.url}
              src={productOrder.product.images[0]!.url}
              alt="product"
              width={40}
              height={40}
              priority={true}
              className="h-auto w-auto rounded"
            />
          ))}
          {order.productOrder.length > 2 ? (
            <p className="flex h-10 w-10 items-center justify-center rounded bg-black-B50 text-small text-black-B500">
              +{order.productOrder.length - 2}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <p className="text-black-B75">Total:</p>
          <p className="text-black-B200">30 SAR</p>
        </div>
      </div>
      <div className="flex w-full flex-col items-end justify-between">
        <ChevronRight color="#1392F3" />
        <Status status={order.status} />
      </div>
    </Link>
  );
}

function Status({
  status,
}: {
  status: RouterOutputs["order"]["getUserOrders"]["orders"][number]["status"];
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        status === "CONFIRMED" && "text-secondary-S300",
        status === "CANCELLED" && "text-red-500",
        (status === "PAID" || status === "DELIVERED") && "text-primary-P300",
      )}
    >
      {status === "CONFIRMED" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
          <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
          <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
        </svg>
      ) : status === "DELIVERED" || status === "PAID" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            clipRule="evenodd"
          />
        </svg>
      ) : status === "CANCELLED" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
            clipRule="evenodd"
          />
        </svg>
      ) : null}
      <p className="text-black-B200">
        {status === "CONFIRMED"
          ? "On the way"
          : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </p>
    </div>
  );
}
