import { useEffect, useRef, useState } from "react";

export function useGeolocation(options: PositionOptions = {}) {
  const [state, setState] = useState<{
    loading: boolean;
    latitude: number | null;
    longitude: number | null;
    timestamp: number | null;
    error: GeolocationPositionError | null;
  }>({
    loading: true,
    latitude: null,
    longitude: null,
    timestamp: null,
    error: null,
  });

  const optionsRef = useRef(options);

  useEffect(() => {
    const onEvent: PositionCallback = ({ coords, timestamp }) => {
      setState({
        loading: false,
        timestamp,
        latitude: coords.latitude,
        longitude: coords.longitude,
        error: null,
      });
    };

    const onEventError: PositionErrorCallback = (error) => {
      setState((s) => ({
        ...s,
        loading: false,
        error,
      }));
    };

    navigator.geolocation.getCurrentPosition(
      onEvent,
      onEventError,
      optionsRef.current,
    );

    const watchId = navigator.geolocation.watchPosition(
      onEvent,
      onEventError,
      optionsRef.current,
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}
