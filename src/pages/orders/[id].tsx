import MyDrawer from "@/components/Bottomsheet/bottomsheet";
import { api } from "@/utils/api";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

const Map = dynamic(() => import("../../components/Map"), {
  ssr: false,
});

export default function OrderPage() {
  const router = useRouter();
  const { id } = router.query;

  const order = api.order.byId.useQuery(
    { orderID: id as string },
    {
      enabled: !!id,
    },
  );

  const [isOpen, setIsOpen] = useState(false);

  if (!order.data || order.isLoading) {
    return (
      <main className="mb-20 flex min-h-screen flex-col gap-3 bg-[#FAFBFC] px-5 pt-4 font-montserrat">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
      </main>
    );
  }
  return (
    <main className="mb-20 flex min-h-screen flex-col gap-3 bg-[#FAFBFC] px-5 pt-4 font-montserrat">
      <div className="pt-12 text-h3 font-bold ">
        <ArrowLeft onClick={() => router.back()} />
        <p className="pt-8">Order details</p>
      </div>
      <div className="flex rounded-md border border-black-B50 bg-white-W50 p-4 shadow-md">
        <div className="flex w-full flex-col gap-4 p-2">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <p className="text-nowrap text-black-B75">order Id </p>
              <p className="text-black-B200">#{order.data.id.slice(-10)}</p>
            </div>
            <p>{order.data.createdAt.toLocaleDateString("en-DE")}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-nowrap text-black-B75">Status</p>
            <p>
              {order.data.status === "CONFIRMED"
                ? "On the way"
                : order.data.status.charAt(0).toUpperCase() +
                  order.data.status.slice(1).toLowerCase()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-nowrap text-black-B75">Delivery Adress</p>
            <p
              className="cursor-pointer text-primary-P300 underline"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              {order.data.address.city}
            </p>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <div className="flex flex-col gap-6 rounded-md border border-black-B50 bg-white-W50 p-4 shadow-md">
          {order.data.productOrder.map((productOrder) => (
            <div
              key={productOrder.productId}
              className="flex grow items-end gap-4"
            >
              <img
                src={productOrder.product.images[0]!.url}
                alt="product"
                width={57}
                height={57}
                priority={true}
                className="h-auto w-auto rounded"
              />
              <div>
                <p className="text-black-B200">{productOrder.product.name}</p>
                <p className="text-black-B75">
                  {productOrder.quantity} x {productOrder.price} SAR
                </p>
              </div>
              <div className="flex grow flex-col items-end gap-2">
                <img
                  alt="store logo"
                  src={productOrder.product.Store.Logo}
                  width={40}
                  height={40}
                  className="rounded"
                />
                <p className="text-black-B200">
                  {productOrder.product.Store.name
                    .split(" ")
                    .slice(0, 1)
                    .join(" ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MyDrawer
        isOpen={isOpen}
        onclose={() => {
          setIsOpen(false);
        }}
      >
        <div className="h-[calc(80vh)]">
          <Map
            initialCenter={[
              Number(order.data.address.lng),
              Number(order.data.address.lat),
            ]}
            staticMarkers={[
              [Number(order.data.address.lng), Number(order.data.address.lat)],
            ]}
          />
        </div>
      </MyDrawer>
    </main>
  );
}
