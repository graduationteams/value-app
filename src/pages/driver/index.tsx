import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { env } from "~/env";
import { useGeolocation } from "~/hooks/use-geolocation";
import { api, type RouterOutputs } from "~/utils/api";

const MapComponent = dynamic(() => import("~/components/Map"), {
  ssr: false,
});

export default function Driver() {
  const session = useSession();
  const router = useRouter();
  const location = useGeolocation();

  const currentDelivery = api.driver.currentDelivery.useQuery();

  useEffect(() => {
    if (session.status === "loading") return;
    if (session.data?.user?.userType !== "DRIVER") {
      void router.push("/");
    }
  }, [session, router]);

  if (
    session.status === "loading" ||
    location.loading ||
    currentDelivery.isLoading
  ) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFBFC]">
        <div className="mb-2 h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
        Loading...
      </div>
    );
  }
  if (session.data?.user.userType !== "DRIVER") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFBFC]">
        Not a driver
      </div>
    );
  }

  if (location.error !== null || !location.longitude || !location.latitude) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFBFC]">
        <p className="text-center text-2xl text-red-500">
          Cant get your location, please enable location services and refresh{" "}
          <br />
          {location.error?.message}
        </p>
      </div>
    );
  }

  // if the driver has no current delivery show available deliveries to accept
  if (!currentDelivery.data) {
    return (
      <Available_Orders location={[location.longitude, location.latitude]} />
    );
  }
  return <CurrentDelivery order={currentDelivery.data} />;
}

function Available_Orders({ location }: { location: [number, number] }) {
  const avalibleOrders = api.driver.availableOrders.useQuery();

  if (avalibleOrders.isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFBFC]">
        <div className="mb-2 h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#FAFBFC]">
      <p className="px-2 py-5 text-h3 font-bold text-black-B300">
        Available Orders
      </p>
      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        {avalibleOrders.data?.map((order) => (
          <OrderCard key={order.id} order={order} driverLocation={location} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  driverLocation,
}: {
  order: RouterOutputs["driver"]["availableOrders"][0];
  driverLocation: [number, number];
}) {
  const route = useQuery({
    queryKey: ["route", order, order, driverLocation],
    queryFn: async () => {
      const routesObj = order.productOrder.reduce<
        Record<string, [string, string]>
      >((acc, cur) => {
        if (!acc[cur.product.storeId]) {
          acc[cur.product.storeId] = [
            cur.product.Store.lng,
            cur.product.Store.lat,
          ];
        }
        return acc;
      }, {});
      const routes = [
        driverLocation,
        ...Object.values(routesObj),
        [order.address.lng, order.address.lat],
      ];

      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${routes
          .map((r) => r.join(","))
          .join(
            ";",
          )}?alternatives=false&annotations=distance&geometries=geojson&language=en&overview=full&steps=true&access_token=${env.NEXT_PUBLIC_MAPBOX_API_TOKEN}`,
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json() as Promise<{
        routes: Array<{ distance: number }>;
      }>;
    },
  });
  const router = useRouter();
  const takeOrder = api.driver.takeOrder.useMutation({
    onSuccess: () => {
      void router.reload();
    },
  });

  if (route.isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-black-B50 bg-white-W50 p-4 shadow-md">
        <div className="mb-2 h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex rounded-md border border-black-B50 bg-white-W50 p-4 shadow-md">
      <div className="flex w-full flex-col gap-4 p-2">
        <div className="flex gap-2">
          <p className="text-black-B75">order Number </p>
          <p className="text-black-B200">123456</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p>
            Total Duration:{" "}
            {((route.data?.routes[0]?.distance ?? 0) / 1000).toFixed(2)} KM
          </p>
          <button
            className="h-12 flex-1 rounded-3xl bg-secondary-S300 text-center text-white-W50 disabled:opacity-50"
            onClick={async () => {
              await takeOrder.mutateAsync({ orderID: order.id });
            }}
          >
            Accept
          </button>
        </div>
        <div className="flex gap-2">
          <p className="text-black-B75">Delivery Fee</p>
          <p className="text-black-B200">{order.deliveryAmount} SAR</p>
        </div>
      </div>
    </div>
  );
}

function CurrentDelivery({
  order,
}: {
  order: RouterOutputs["driver"]["currentDelivery"];
}) {
  const location = useGeolocation();
  const router = useRouter();
  const [routes, setRoutes] = useState<[number | string, number | string][]>(
    [],
  );

  useEffect(() => {
    if (!order || !location.latitude || !location.longitude) return;
    const routesObj = order.productOrder.reduce<
      Record<string, [string, string]>
    >((acc, cur) => {
      if (!acc[cur.product.storeId]) {
        acc[cur.product.storeId] = [
          cur.product.Store.lng,
          cur.product.Store.lat,
        ];
      }
      return acc;
    }, {});
    const routes: [number | string, number | string][] = [
      [location.longitude, location.latitude],
      ...Object.values(routesObj),
      [order.address.lng, order.address.lat],
    ];
    setRoutes(routes);
  }, [location.latitude, location.longitude, order]);

  const confirmDelivery = api.order.confirmDelivery.useMutation({
    onSuccess: () => {
      void router.reload();
    },
  });

  if (location.loading || !location.longitude || !location.latitude) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen bg-[#FAFBFC]">
      <p className="px-2 py-5 text-h3 font-bold text-black-B300">
        Current Delivery
      </p>
      <div className="h-[calc(80vh)] py-4">
        <MapComponent
          initialCenter={[location.longitude, location.latitude]}
          staticMarkers={routes.map((r) => [Number(r[0]), Number(r[1])])}
          routes={routes}
        />
      </div>
      <button
        className="h-12 w-full rounded-3xl bg-primary-P300 text-center text-white-W50"
        onClick={async () => {
          if (!order) return;
          await confirmDelivery.mutateAsync({ orderID: order.id });
        }}
      >
        Confirm Delivery
      </button>
    </div>
  );
}
