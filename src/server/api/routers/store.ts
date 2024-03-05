import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { upload_base64_image } from "~/utils/upload";

export const storeRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        storeID: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const store = await ctx.db.store.findUnique({
        where: {
          id: input.storeID,
        },
      });
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }
      return store;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        address: z.string().min(3),
        lat: z.string(),
        lng: z.string(),
        Logo: z.string(),
        userID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // only admin can create store and assign seller
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      if (!user || user.userType !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to create store",
        });
      }

      const image = await upload_base64_image(input.Logo);

      await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: input.userID },
          data: { userType: "SELLER" },
        }),
        ctx.db.store.create({
          data: {
            name: input.name,
            address: input.address,
            lat: input.lat,
            lng: input.lng,
            Logo: image,
            sellerId: input.userID,
          },
        }),
      ]);
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        address: z.string().min(3).optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
        Logo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.db.store.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }
      if (
        store.sellerId !== ctx.session.user.id &&
        ctx.session.user.userType !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this store",
        });
      }
      let image = undefined;
      if (input.Logo) {
        image = await upload_base64_image(input.Logo);
      }
      return ctx.db.store.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          address: input.address,
          lat: input.lat,
          lng: input.lng,
          Logo: image,
        },
      });
    }),
});
