import { createInnerTRPCContext } from "@/server/api/trpc";
import { appRouter } from "../server/api/root";

import { expect, describe, it } from "vitest";

describe("Products", () => {
  const ctx = createInnerTRPCContext({
    session: {
      expires: "",
      user: {
        id: "clvp0sbzj000410rk7sl0065b", // user@value.app id
        email: "",
        isPassword: true,
        phone: "",
        name: "",
        picture: "",
        userType: "USER",
        image: "",
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    req: null as any,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    res: null as any,
  });

  const caller = appRouter.createCaller(ctx);

  it(
    "categories test",
    async () => {
      const products = await caller.products.getByCategoryType({
        categoryType: "FARM",
      });
      expect(products).toBeDefined();
      expect(products.length).toBeGreaterThan(0);
    },
    { timeout: 100000 },
  );
  it("groupBuy", async () => {
    const groupBuy = await caller.product.getGroupBuy({ take: 5 });
    expect(groupBuy).toBeDefined();
    expect(groupBuy.length).toBeGreaterThan(0);
    groupBuy.forEach((product) => {
      expect(product.is_group_buy).toBe(true);
    });
  });
  it("all", async () => {
    const products = await caller.products.all();
    expect(products).toBeDefined();
    expect(products.length).toBeGreaterThan(0);
  });
});
