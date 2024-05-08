import { expect, describe, it } from "vitest";
import { getAdress } from "@/utils/mapbox";

describe("Mapbox", () => {
  it(
    "get Adress",
    async () => {
      const adress = await getAdress(43.99697026438026, 26.252820655122168);
      expect(adress.features?.[0]?.place_name_ar).toBe(
        "شارع السالمية 8317، بريدة، السعودية",
      );
    },
    { timeout: 10000000 },
  );
});
