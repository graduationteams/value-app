import React, { memo, useEffect } from "react";
import mapbox from "mapbox-gl";
import { env } from "~/env";
import { useGeolocation } from "@/hooks/use-geolocation";
import Image from "next/image";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import type { RouterOutputs } from "@/utils/api";

if (mapbox.getRTLTextPluginStatus() === "unavailable") {
  // this plugin is needed for arabic text to be displayed correctly
  mapbox.setRTLTextPlugin(
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
    (err) => {
      if (err) {
        console.error("Error in map:", err);
      }
    },
    true, // Lazy load the plugin
  );
}
function Map({
  onMove,
  initialCenter,
  staticMarkers = [],
  selectMarker = false,
  routes,
  stores,
}: {
  onMove?: (center: [number, number]) => void;
  initialCenter: [number, number];
  staticMarkers?: [number, number][];
  selectMarker?: boolean;
  routes?: [number | string, number | string][];
  stores?: RouterOutputs["store"]["all"];
}) {
  const [map, setMap] = React.useState<mapboxgl.Map>();

  const currentLocation = useGeolocation();

  useEffect(() => {
    const nMap = new mapbox.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: initialCenter,
      zoom: 9,
      accessToken: env.NEXT_PUBLIC_MAPBOX_API_TOKEN,
    })
    setMap(
      nMap
    );
    nMap.getCanvas().setAttribute("data-vaul-no-drag", "true");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map || !selectMarker) return;


    const marker = new mapbox.Marker({
      color: "red",
    })
      .setLngLat(initialCenter)
      .addTo(map);
    marker.getElement().addEventListener("click", (e) => console.log(e));
    marker.getElement().style.cursor = "pointer";
    map.on("move", (ev) => {
      if (onMove) {
        onMove(ev.target.getCenter().toArray() as [number, number]);
        marker.setLngLat(ev.target.getCenter());
      }
    });
    return () => {
      marker.remove();
    };
  }, [map, onMove, initialCenter, selectMarker]);

  useEffect(() => {
    if (!map || !routes?.length) return;
    void getRoute(routes, map);
  }, [map, routes]);

  useEffect(() => {
    if (!map) return;
    staticMarkers.forEach((marker) => {
      new mapbox.Marker({
        color: "blue",
      })
        .setLngLat(marker)
        .addTo(map);
    });
  }, [map, staticMarkers]);

  useEffect(() => {
    if (!map || !stores?.length) return;
    stores.forEach((store) => {
      // calculate the distance between the user and the store

      const el = document.createElement("div");
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
      <path d="M2.879 7.121A3 3 0 0 0 7.5 6.66a2.997 2.997 0 0 0 2.5 1.34 2.997 2.997 0 0 0 2.5-1.34 3 3 0 1 0 4.622-3.78l-.293-.293A2 2 0 0 0 15.415 2H4.585a2 2 0 0 0-1.414.586l-.292.292a3 3 0 0 0 0 4.243ZM3 9.032a4.507 4.507 0 0 0 4.5-.29A4.48 4.48 0 0 0 10 9.5a4.48 4.48 0 0 0 2.5-.758 4.507 4.507 0 0 0 4.5.29V16.5h.25a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5H3V9.032Z" />
    </svg>
    `;
      const placeholder = document.createElement("div");
      const root = createRoot(placeholder);
      root.render(
        <div>
          <div className="flex min-h-24 gap-4">
            <Image
              className="h-24 w-24 rounded-lg"
              src={store.logo}
              alt={store.name}
              width={48}
              height={48}
            />
            <div>
              <p className="text-base font-bold">{store.name}</p>
              <p className="text-sm text-gray-500">
                {`${store.dist_km.toFixed(2)} KM away`}
              </p>
            </div>
          </div>
          <Link
            href="#" //TODO: Go to store page
            className="mt-2 block w-full cursor-pointer rounded bg-primary-P300 p-2 text-center text-white-W50 no-underline"
          >
            Go to Store Page
          </Link>
        </div>,
      );

      new mapbox.Marker(el, {
        color: "green",
      })
        .setLngLat([parseFloat(store.long), parseFloat(store.lat)])
        .setPopup(new mapbox.Popup({ offset: 25 }).setDOMContent(placeholder))
        .addTo(map);
    });
  }, [currentLocation.latitude, currentLocation.longitude, map, stores]);

  return <div data-vaul-no-drag id="map" className="h-full w-full"></div>;
}

export default memo(Map);

// create a function to make a directions request
async function getRoute(
  routes: [number | string, number | string][],
  map: mapbox.Map,
) {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${routes
      .map((r) => r.join(","))
      .join(
        ";",
      )}?steps=true&geometries=geojson&access_token=${env.NEXT_PUBLIC_MAPBOX_API_TOKEN}`,
    { method: "GET" },
  );
  const json = (await query.json()) as {
    routes: Array<{
      geometry: {
        coordinates: [number, number][];
      };
    }>;
  };
  const data = json.routes[0];
  const route = data?.geometry.coordinates;
  if (!route) {
    return;
  }
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route,
    },
  };
  // if the route already exists on the map, we'll reset it using setData
  if (map.getSource("route")) {
    // @ts-expect-error we are sure that the source exists,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    map.getSource("route").setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    map.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route,
          },
        },
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3887be",
        "line-width": 5,
        "line-opacity": 0.75,
      },
    });
  }
}
