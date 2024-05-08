export const getAdress = async (
  lang: string | number,
  lat: string | number,
) => {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lang},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}&types=address&language=ar`,
    {},
  );
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json() as Promise<{
    features?: Array<{ place_name_ar?: string }>;
  }>;
};
