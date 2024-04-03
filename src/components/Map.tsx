import React, { memo, useEffect } from "react";
import mapbox from "mapbox-gl";
import { env } from "~/env";

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
}: {
  onMove?: (center: [number, number]) => void;
  initialCenter: [number, number];
  staticMarkers?: [number, number][];
  selectMarker?: boolean;
  routes?: [number | string, number | string][];
}) {
  const [map, setMap] = React.useState<mapboxgl.Map>();

  useEffect(() => {
    setMap(
      new mapbox.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: initialCenter,
        zoom: 9,
        accessToken: env.NEXT_PUBLIC_MAPBOX_API_TOKEN,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map || !selectMarker) return;

    map.getCanvas().setAttribute("data-vaul-no-drag", "true");

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
