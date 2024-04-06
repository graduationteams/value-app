import Image from "next/image";
import { api } from "~/utils/api";

import Navbar from "~/components/Navbar/Navbar";
import { useState } from "react";
import MapPin from "~/components/icons/map-pin";
import Map from "@/components/icons/map";
import Search from "@/components/icons/search";
import { cn } from "@/lib/utils";
import EmblaCarousel from "@/components/Ads-home";
import { useSession } from "next-auth/react";
import { useAdressStore, usePastSearchesStore } from "@/zustand/store";
import AdressSelector from "@/components/adress-selector";
import { AuthDrawer } from "@/components/auth-drawer";
import { Stores } from "@/components/stores-map";
import { X } from "@/components/icons/X";
import { X as XOutline } from "lucide-react";
import ProductCard from "@/components/productcard/productcard";

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

  const [isSearch, setIsSearch] = useState(false);

  if (isSearch) {
    return (
      <main className="mb-16 flex h-screen flex-col gap-3 bg-[#FAFBFC] px-4 pt-4 font-montserrat">
        <SearchScreen
          onclose={() => {
            setIsSearch(false);
          }}
        />
      </main>
    );
  }

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
              className="flex-grow bg-black-B50 text-small text-gray-700 focus:outline-none"
              onFocus={() => {
                setIsSearch(true);
              }}
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

function SearchScreen({ onclose }: { onclose: () => void }) {
  const [search, setSearch] = useState("");

  const { addPastSearch, pastSearches, removePastSearch } =
    usePastSearchesStore();

  const searchData = api.product.search.useQuery(
    {
      query: search,
    },
    {
      enabled: search.length > 2,
    },
  );
  console.log(searchData.data);

  return (
    <div className="flex h-full flex-col gap-4 pt-4">
      <div className="flex items-center justify-between align-middle">
        <div
          onClick={() => {
            onclose();
          }}
        >
          <X />
        </div>
        <p className="mb-0 flex-[2] text-center text-h5">Search</p>
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="flex h-8 flex-1 items-center gap-2 rounded-lg bg-black-B50 px-2 py-2">
          <Search />
          <input
            type="text"
            placeholder="search in value"
            className="flex-grow bg-black-B50 text-small text-gray-700 focus:outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onBlur={() => {
              if (search.length > 2) {
                addPastSearch(search);
              }
            }}
          />
        </div>
        <div
          className="flex cursor-pointer items-center justify-center"
          onClick={() => {
            setSearch("");
            onclose();
          }}
        >
          <p className="mb-0">cancel</p>
        </div>
      </div>
      <div className="grow">
        {search.length > 2 && searchData.isLoading ? (
          <div className="flex items-center justify-center">
            <div className="h-32 w-32 animate-spin self-center rounded-full border-b-2 border-t-2 border-gray-900" />
          </div>
        ) : search.length > 2 && searchData.data?.length === 0 ? (
          <p className="text-center">No products found</p>
        ) : searchData.data ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-center justify-items-center gap-2">
            {searchData.data.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                storeName={product.Store.name}
                productName={product.name}
                productImage={
                  product.images?.[0]?.url ?? "https://via.placeholder.com/150"
                }
                AdditionalInfo={product.description
                  .split(" ")
                  .slice(0, 5)
                  .join(" ")}
                Price={product.price}
                StoreLogo={product.Store.Logo}
              />
            ))}
          </div>
        ) : pastSearches.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              {pastSearches.map((search) => (
                <div key={search} className="flex items-center gap-2">
                  <div
                    className="cursor-pointer text-black-B100"
                    onClick={() => {
                      removePastSearch(search);
                    }}
                  >
                    <XOutline />
                  </div>
                  <p
                    className="mb-0 grow cursor-pointer text-small text-black-B100"
                    onClick={() => {
                      setSearch(search);
                    }}
                  >
                    {search}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center">start typing to search for products</p>
        )}
      </div>
    </div>
  );
}
