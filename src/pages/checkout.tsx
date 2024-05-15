import AdressSelector from "@/components/adress-selector";
import { DELIVERY_COST } from "@/lib/constants";
import { api } from "@/utils/api";
import { useAdressStore } from "@/zustand/store";
import { ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Checkout() {
  const session = useSession();
  const cart = api.cart.get.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  const { selectedAdress, setSelectedAdress } = useAdressStore();

  const adressess = api.address.userAddresses.useQuery();

  const [adressSelector, setAdressSelector] = useState(false);
  const router = useRouter();

  const createOrder = api.order.create.useMutation({
    onSuccess: (data) => {
      void router.push({
        pathname: `/payment`,
        query: { orderId: data.id, amount: data.totalAmount * 100 },
      });
    },
  });

  useEffect(() => {
    if (adressess.isLoading) return;
    if (!adressess.data?.find((adress) => adress.id === selectedAdress)) {
      console.log("selected adress is not in the list");
      setSelectedAdress(null);
    }
  }, [selectedAdress, adressess.data, adressess.isLoading, setSelectedAdress]);

  if (cart.isLoading || adressess.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary-P300"></div>
      </div>
    );
  }

  if (cart.data == null || cart.data.products.length === 0) {
    return (
      <main className="flex min-h-screen flex-col gap-3 bg-[#FAFBFC] px-4 pt-12 font-montserrat">
        <div className="flex gap-2">
          <ChevronLeft
            className="self-start"
            onClick={() => {
              router.back();
            }}
          />
          <p className="mx-auto text-2xl">Checkout Page</p>
        </div>
        <div className="m-auto text-xl">
          <p>Your cart is empty</p>
          <p>
            Start shopping&nbsp;
            <Link href="/" className="text-primary-P300 underline">
              Now
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-3 bg-[#FAFBFC] px-4 pt-12 font-montserrat">
      <div className="flex w-full gap-2 self-start">
        <ChevronLeft
          className="self-start"
          onClick={() => {
            router.back();
          }}
        />
        <p className="mx-auto text-2xl">Checkout Page</p>
      </div>
      <div className="pt-12">
        <p className="text-lg">
          Shipping Address:&nbsp;
          <span
            className="cursor-pointer text-primary-P300 underline"
            onClick={() => {
              setAdressSelector(true);
            }}
          >
            {adressess.data?.find((e) => e.id === selectedAdress)?.city}
          </span>
        </p>

        <div className="flex flex-col gap-3">
          {cart.data.products.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                width={112}
                height={112}
                src={item.product.images[0]?.url ?? "/no-image.png"}
                alt={item.product.name}
                className="h-28 w-28 rounded-md object-cover"
              />
              <div className="flex flex-col gap-1">
                <p className="text-lg">{item.product.name}</p>
                <p className="text-sm text-gray-500">x {item.quantity}</p>
              </div>
              <div className="my-auto">
                <p>
                  {new Intl.NumberFormat("ar", {
                    style: "currency",
                    currency: "SAR",
                  }).format(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full justify-between pt-12">
          <p className="text-lg">Items</p>
          <p className="text-lg">
            {new Intl.NumberFormat("ar", {
              style: "currency",
              currency: "SAR",
            }).format(
              cart.data.products.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0,
              ),
            )}
          </p>
        </div>
        <div className="flex w-full justify-between">
          <p className="text-lg">Delivery</p>
          <p className="text-lg">
            {new Intl.NumberFormat("ar", {
              style: "currency",
              currency: "SAR",
            }).format(DELIVERY_COST)}
          </p>
        </div>
        <div className="flex w-full justify-between">
          <p className="text-lg">Total</p>
          <p className="text-lg">
            {new Intl.NumberFormat("ar", {
              style: "currency",
              currency: "SAR",
            }).format(
              cart.data.products.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                DELIVERY_COST,
              ),
            )}
          </p>
        </div>
        <button
          className="mt-4 w-full rounded-md bg-primary-P300 p-2 text-white-W50"
          onClick={() => {
            if (
              !selectedAdress ||
              !adressess.data?.find((e) => e.id === selectedAdress)
            )
              return alert("Please select an address");
            createOrder.mutate({
              addressID: selectedAdress,
            });
          }}
        >
          Checkout
        </button>
      </div>
      <AdressSelector
        isAddressesDrawerOpen={adressSelector}
        setIsAddressesDrawerOpen={setAdressSelector}
      />
    </main>
  );
}
