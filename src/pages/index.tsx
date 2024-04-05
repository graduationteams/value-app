import Image from "next/image";
import { api } from "~/utils/api";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "~/components/Navbar/Navbar";
import { useState } from "react";
import MapPin from "~/components/icons/map-pin";
import Map from "@/components/icons/map";
import Search from "@/components/icons/search";
import { cn } from "@/lib/utils";
import EmblaCarousel from "@/components/Ads-home";
import { useSession } from "next-auth/react";
import { useAdressStore } from "@/zustand/store";
import AdressSelector from "@/components/adress-selector";
import { AuthDrawer } from "@/components/auth-drawer";
import { Stores } from "@/components/stores-map";

// Todo: This is a mock data for the categories, it should be fetched from the backend
const categories: Record<
  string,
  Array<{ name: string; image: string; width?: number }>
> = {
  regular: [
    {
      name: "Household Supplies",
      image: "/images/tide.png",
    },
    {
      name: "Food and Groceries",
      image: "/images/food.png",
    },
    {
      name: "Personal Care and Hygiene",
      image: "/images/personal.png",
    },
    {
      name: "Electronics and Accessories",
      image: "/images/headset.png",
    },
    {
      name: "Medical Supplies",
      image: "/images/panadol.png",
    },
  ],
  farms: [
    {
      name: "Dates",
      image: "/images/dates.png",
      width: 66,
    },
    {
      name: "Fruits and Vegetables",
      image: "/images/vegetables.png",
      width: 78,
    },
    {
      name: "Dairy Products",
      image: "/images/milk.png",
      width: 62,
    },
    {
      name: "Processed Goods",
      image: "/images/peanutbutter.png",
      width: 56,
    },
    {
      name: "Crops and Grains",
      image: "/images/crops.png",
      width: 76,
    },
  ],
};

export default function Home() {
  const session = useSession();

  const selectedAdress = useAdressStore((state) => state.selectedAdress);

  const adress = api.address.get.useQuery(
    { id: selectedAdress ?? "" },
    {
      enabled: selectedAdress != null && session.status === "authenticated",
    },
  );

  const [selectedCategory, setSelectedCategory] = useState("regular");

  const [adressSelectorOpen, setAdressSelectorOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);

  const [StoresOpen, setStoresOpen] = useState(false);

  // to test uncomment this :
  // const { data: categoriesData, isLoading, isError } = api.categories.getByType.useQuery( { categoryType: 'FARM' });

  return (
    <>
      <main className="mb-16 flex h-screen flex-col gap-3 bg-[#FAFBFC] px-4 pt-4 font-montserrat">
        <div className="flex items-center justify-between">
          {session.status === "authenticated" ? (
            <p>Hala! {session.data?.user.name ?? ""}👋</p>
          ) : (
            <p
              className="mb-0 cursor-pointer rounded bg-primary-P300 p-2 text-center text-white-W50"
              onClick={() => {
                setAuthOpen(true);
              }}
            >
              Sign in
            </p>
          )}

          <div
            className="flex cursor-pointer items-center gap-1"
            onClick={() => {
              setAdressSelectorOpen(true);
            }}
          >
            <MapPin />
            <p className="mb-0">{adress.data?.city ?? "Location"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex h-8 flex-1 items-center gap-2 rounded-lg bg-black-B50 px-2 py-2">
            <Search />
            <input
              type="text"
              placeholder="search in value"
              className="bg-black-B50 text-small text-gray-700 focus:outline-none"
            />
          </div>
          <div
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black-B50"
            onClick={() => {
              setStoresOpen(true);
            }}
          >
            <Map />
          </div>
        </div>

        <div className="grid h-16 grid-cols-2 gap-4">
          {Object.keys(categories).map((categoryType) => (
            <div
              onClick={() => setSelectedCategory(categoryType)}
              className={cn(
                "flex cursor-pointer justify-between rounded-lg border-2 bg-black-B50 px-2",
                selectedCategory === categoryType &&
                  selectedCategory === "regular" &&
                  "border-secondary-S300 bg-white-W50 text-secondary-S300",
                selectedCategory === categoryType &&
                  selectedCategory === "farms" &&
                  "border-[#DBA45F] bg-white-W50 text-[#DBA45F]",
              )}
              key={categoryType}
            >
              <p className="mb-0 self-end pb-2">{categoryType}</p>

              <div className="flex justify-center pr-4 pt-1">
                <Image
                  alt={categoryType + " icon"}
                  style={{
                    objectFit: "contain",
                  }}
                  height={0}
                  width={categoryType === "regular" ? 56 : 34}
                  src={
                    "/images/" +
                    (categoryType === "regular"
                      ? "convenience.png"
                      : "farm.png")
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(categories[selectedCategory] ?? []).map((category) => (
            <div
              key={category.name}
              className={cn(
                "flex h-28 min-w-28 flex-col justify-between rounded-lg bg-secondary-S50",
                selectedCategory === "farms" && "bg-[#F4EADD]",
              )}
            >
              <p className="mb-0 px-2 pt-2 text-small font-medium">
                {category.name}
              </p>
              <div className="self-end overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={category.name + " icon"}
                  style={{
                    objectFit: "contain",
                    overflow: "hidden",
                  }}
                  src={category.image}
                  width={
                    category.name == "Food and Groceries" ? 45 : category.width
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <EmblaCarousel />
      </main>
      <Navbar />
      <AdressSelector
        isAddressesDrawerOpen={
          adressSelectorOpen && session.status === "authenticated"
        }
        setIsAddressesDrawerOpen={(isOpen) => setAdressSelectorOpen(isOpen)}
      />
      <AuthDrawer
        isOpen={session.status === "unauthenticated" && authOpen}
        onClose={async () => {
          setAuthOpen(false);
        }}
      />
      <Stores
        isOpen={StoresOpen}
        onClose={() => {
          setStoresOpen(false);
        }}
      />
    </>
  );
}
