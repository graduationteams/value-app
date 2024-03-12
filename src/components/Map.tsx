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
}: {
  onMove?: (center: [number, number]) => void;
  initialCenter: [number, number];
  staticMarkers?: [number, number][];
  selectMarker?: boolean;
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
