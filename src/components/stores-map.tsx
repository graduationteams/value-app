import { api } from "@/utils/api";
import MyDrawer from "./Bottomsheet/bottomsheet";

import { useGeolocation } from "@/hooks/use-geolocation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export function Stores({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const location = useGeolocation();

  const stores = api.store.all.useQuery(
    {
      lat: location.latitude,
      long: location.longitude,
    },
    {
      enabled:
        isOpen && location.latitude !== null && !!location.longitude !== null,
    },
  );

  return (
    <MyDrawer isOpen={isOpen} onclose={onClose}>
      {location.error ? (
        <div className="h-[calc(80vh)]">
          <p className="text-center">
            Please enable location to view stores near you 📍
          </p>
        </div>
      ) : stores.isLoading ? (
        <div className="flex h-[calc(80vh)] items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="h-[calc(80vh)]">
          <Map
            initialCenter={[location.longitude ?? 0, location.latitude ?? 0]}
            stores={stores.data ?? []}
          />
        </div>
      )}
    </MyDrawer>
  );
}
