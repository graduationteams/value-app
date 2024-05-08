import { createInnerTRPCContext } from "@/server/api/trpc";
import { appRouter } from "../server/api/root";
import { db } from "../server/db";

import { expect, describe, it } from "vitest";
import { DELIVERY_COST } from "@/lib/constants";

describe("Orders", () => {
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
    "Create an order",
    async () => {
      const product = await db.product.findFirst({
        where: { is_group_buy: false },
      });
      if (!product) {
        throw new Error("No product found");
      }

      let cart = await caller.cart.get();

      await caller.cart.add({ productId: product.id });
      await caller.cart.add({ productId: product.id });
      await caller.cart.add({ productId: product.id });

      cart = await caller.cart.get();

      expect(cart?.products.length).toBe(1);
      expect(cart?.products[0]?.quantity).toBeGreaterThanOrEqual(3);

      const address = await caller.address.userAddresses();
      if (address.length === 0) {
        throw new Error("No address found");
      }

      const order = await caller.order.create({
        addressID: address[0]!.id,
      });

      expect(order?.id).toBeDefined();
      expect(order.deliveryAmount).toBe(DELIVERY_COST);
      expect(order.userId).toBe(ctx.session!.user.id);
    },
    { timeout: 100000 },
  );
});
