import { createInnerTRPCContext } from "@/server/api/trpc";
import { appRouter } from "../server/api/root";

import { expect, describe, it } from "vitest";
import { db } from "@/server/db";

describe("Auth", () => {
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
    "Edit user",
    async () => {
      try {
        await caller.auth.edit({
          phoneNumber: "1234567890",
        });
        expect(false).toBe(true); // should not reach here
      } catch (error) {}

      await caller.auth.edit({
        phoneNumber: "0501530898",
      });

      const user = await db.user.findFirstOrThrow({
        where: { id: ctx.session!.user.id },
      });

      expect(user.phone).toBe("0501530898");
    },
    { timeout: 100000 },
  );
});
