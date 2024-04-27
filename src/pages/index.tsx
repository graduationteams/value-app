import Image from "next/image";
import { api } from "~/utils/api";

import { useEffect, useState } from "react";
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
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";
import ProductCard from "@/components/productcard/productcard";
import { ArrowBigRight } from "lucide-react";
import Link from "next/link";
import type { CategoryType } from "@prisma/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import { db } from "@/server/db";
import SuperJSON from "superjson";

export async function getServerSideProps() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      db: db,
      session: null,
      // we use req and res for register only so we can ignore them here for now

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      req: null as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      res: null as any,
    },
    transformer: SuperJSON,
  });

  await helpers.categories.all.prefetch();
  await helpers.product.getGroupBuy.prefetch({ take: 5 });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}

export default function Home() {
  const session = useSession();

  const { selectedAdress, setSelectedAdress } = useAdressStore();

  const adress = api.address.get.useQuery(
    { id: selectedAdress ?? "" },
    {
      enabled: selectedAdress != null && session.status === "authenticated",
    },
  );

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("REGULAR");

  const [adressSelectorOpen, setAdressSelectorOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);

  const [StoresOpen, setStoresOpen] = useState(false);

  const [categoriesParent] = useAutoAnimate();

  const router = useRouter();

  const groupBuying = api.product.getGroupBuy.useQuery({ take: 5 });

  const categories = api.categories.all.useQuery();

  useEffect(() => {
    if (session.status === "unauthenticated" && selectedAdress != null) {
      setSelectedAdress(null);
    }
  });

  return (
    <main className="mb-20 flex min-h-screen flex-col gap-3 bg-[#FAFBFC] px-4 pt-4 font-montserrat">
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
            onFocus={(e) => {
              e.target.blur();
              void router.push("/search");
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
        {categories.data
          ?.map((e) => e.categoryType)
          .filter((value, index, self) => self.indexOf(value) === index)
          .map((categoryType) => (
            <div
              onClick={() => setSelectedCategory(categoryType)}
              className={cn(
                "flex cursor-pointer justify-between rounded-lg border-2 bg-black-B50 px-2",
                selectedCategory === categoryType &&
                  selectedCategory === "REGULAR" &&
                  "border-secondary-S300 bg-white-W50 text-secondary-S300",
                selectedCategory === categoryType &&
                  selectedCategory === "FARM" &&
                  "border-[#DBA45F] bg-white-W50 text-[#DBA45F]",
              )}
              key={categoryType}
            >
              <p className="mb-0 self-end pb-2">
                {categoryType === "REGULAR" ? "Grocery" : "Farm"}
              </p>
              <div className="flex justify-center pr-4 pt-1">
                <Image
                  alt={categoryType + " icon"}
                  style={{
                    objectFit: "contain",
                  }}
                  height={0}
                  width={categoryType === "REGULAR" ? 56 : 34}
                  src={
                    "/images/" +
                    (categoryType === "REGULAR"
                      ? "convenience.png"
                      : "farm.png")
                  }
                />
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-3 gap-2" ref={categoriesParent}>
        {(
          categories.data?.filter(
            (category) => category.categoryType === selectedCategory,
          ) ?? []
        ).map((category) => (
          <Link
            href={`/category/${category.name}`}
            key={category.name}
            className={cn(
              "flex h-28 min-w-28 flex-col justify-between rounded-lg bg-secondary-S50",
              selectedCategory === "FARM" && "bg-[#F4EADD]",
            )}
          >
            <p className="mb-0 px-2 pt-2 text-small font-medium">
              {category.name}
            </p>
            <div className="self-end overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                alt={category.name + " icon"}
                style={{
                  objectFit: "contain",
                  overflow: "hidden",
                }}
                src={category.image}
                width={category.image_width ?? 40}
                height={40}
              />
            </div>
          </Link>
        ))}
      </div>
      <EmblaCarousel />
      <div>
        <h1>Group Buying</h1>
        <div className="flex min-h-56 flex-shrink-0 gap-2 overflow-scroll">
          {groupBuying.data?.map((product) => (
            <div key={product.id} className="mt-auto flex-shrink-0">
              <ProductCard
                id={product.id}
                storeName={product.storeName}
                productName={product.name}
                productImages={product.images}
                AdditionalInfo={product.description
                  .split(" ")
                  .slice(0, 5)
                  .join(" ")}
                Price={product.price}
                StoreLogo={product.Logo}
                groupBuyCurrentOrders={product.currentorders}
                groupBuyEndDateTime={product.group_buy_end ?? undefined}
                groupBuyRequiredOrders={product.required_qty ?? undefined}
                isGroupBuying={product.is_group_buy}
              />
            </div>
          ))}
          <Link
            href={"/group-buying"}
            className="bg-white flex min-h-72 w-40 flex-shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-t border-dashed border-gray-200 bg-black-B50 text-center font-sans shadow-lg"
          >
            <ArrowBigRight />
            <div>Discover more products</div>
          </Link>
        </div>
      </div>
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
    </main>
  );
}
