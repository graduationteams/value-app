import Search from "@/components/icons/search";
import { X } from "@/components/icons/X";
import ProductCard from "@/components/productcard/productcard";
import { api } from "@/utils/api";
import { usePastSearchesStore } from "@/zustand/store";
import { useEffect, useState } from "react";
import { X as XOutline } from "lucide-react";
import { useRouter } from "next/router";
import Lottie from "lottie-react";

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [animationData, setAnimationData] = useState(null);
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

  const router = useRouter();

  useEffect(() => {
    fetch("/loader.json")
      .then((response) => response.json())
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .then((data) => setAnimationData(data))
      .catch((error) =>
        console.error("Error loading the animation data:", error),
      );
  }, []);
  function onclose() {
    router.back();
  }
  return (
    <div className="mb-16 flex h-screen flex-col gap-3 bg-[#FAFBFC] px-4 pt-4 font-montserrat">
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
              {animationData && (
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  style={{ width: 100, height: 100 }}
                />
              )}
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
                  productImages={product.images.map((image) => image.url) ?? []}
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
                {pastSearches.map((search, idx) => (
                  <div key={idx} className="flex items-center gap-2">
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
    </div>
  );
}
