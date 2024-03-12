import dynamic from "next/dynamic";
import MyDrawer from "./Bottomsheet/bottomsheet";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebounce } from "~/hooks/use-debounce";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
});

export function AddressLocator({
  isOpen,
  onClose,
  onSaveAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (
    address: string | undefined,
    langLat: [number, number],
  ) => void;
}) {
  const [initilized, setInitilized] = useState(false);

  const [langlat, setLangLat] = useState([
    43.50872288750617, 25.869114026478044,
  ] as [number, number]);

  const debouncedLanglat = useDebounce(langlat, 1000);

  const { data: address, isLoading } = useQuery({
    queryKey: ["adresss", debouncedLanglat],
    queryFn: async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${debouncedLanglat[0]},${debouncedLanglat[1]}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}&types=address&language=ar`,
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json() as Promise<{
        features?: Array<{ place_name_ar?: string }>;
      }>;
    },
  });

  useEffect(() => {
    if (initilized) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (initilized) return;

        setLangLat([position.coords.longitude, position.coords.latitude]);
        setInitilized(true);
      },
      (err) => {
        console.error(err);
        setInitilized(true);
      },
      {
        timeout: 5000, // if the user takes more than 5 seconds to respond, we will stop trying to get the location
      },
    );
  }, [initilized]);

  const addressSplit = address?.features?.[0]?.place_name_ar?.split("،");
  const addressSubText = addressSplit?.[0];
  const adressText =
    addressSplit?.length ?? 0 >= 3
      ? addressSplit?.[1] + "،" + addressSplit?.[2]
      : "";

  return (
    <MyDrawer isOpen={isOpen && initilized} onclose={onClose}>
      <div className="flex h-[calc(80vh)] flex-col">
        <div className="flex-1">
          <MapComponent
            onMove={(center) => {
              setLangLat(center);
            }}
            initialCenter={langlat}
            selectMarker
          />
        </div>
        <div className="m-4 h-14 rounded-lg bg-secondary-S50">
          <p className="mb-0 pl-2 pt-2 text-medium">{adressText ?? ""}</p>
          <p className="pl-2 pt-1 text-xsmall text-black-B75">
            {addressSubText ?? ""}
          </p>
        </div>
        <div className="mb-4 w-full p-4">
          <button
            disabled={isLoading}
            className="h-12 w-full rounded-3xl bg-primary-P300 text-center text-white-W50 disabled:opacity-50"
            onClick={() => {
              onSaveAddress(address?.features?.[0]?.place_name_ar, langlat);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </MyDrawer>
  );
}
