import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const addressRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        city: z.string(),
        lat: z.string(),
        lng: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newAddress = await ctx.db.address.create({
        data: {
          ...input,
          userId: ctx.session.user.id, // Assuming we get the user ID from the session
        },
      });
      return newAddress;
    }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const address = await ctx.db.address.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }
      return address;
    }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        city: z.string().optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const address = await ctx.db.address.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }
      if (address.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this address",
        });
      }
      const updatedAddress = await ctx.db.address.update({
        where: {
          id: input.id,
        },
        data: {
          city: input.city,
          lat: input.lat,
          lng: input.lng,
        },
      });
      return updatedAddress;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const address = await ctx.db.address.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }
      if (address.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this address",
        });
      }
      await ctx.db.address.delete({
        where: {
          id: input.id,
        },
      });
      return { success: true, message: "Address deleted successfully" };
    }),
  userAddresses: protectedProcedure.query(async ({ ctx }) => {
    const addresses = await ctx.db.address.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return addresses;
  }),
});
