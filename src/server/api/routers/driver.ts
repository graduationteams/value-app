import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const driverRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        driverId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.driver.findUniqueOrThrow({
        where: { userId: input.driverId },
      });
    }),
  availableOrders: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.userType !== "DRIVER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to access this resource",
      });
    }

    const orders = ctx.db.order.findMany({
      where: {
        status: "CONFIRMED",
        driverId: null,
      },
      include: {
        productOrder: {
          include: { product: { include: { Store: true } } },
        },
        address: true,
      },
    });

    return orders;
  }),

  takeOrder: protectedProcedure
    .input(
      z.object({
        orderID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: {
          id: input.orderID,
        },
      });
      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found with id " + input.orderID,
        });
      }
      if (order.status !== "CONFIRMED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order status is not CONFIRMED",
        });
      }
      if (ctx.session.user.userType !== "DRIVER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to access this resource",
        });
      }
      if (order.driverId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order already has a driver",
        });
      }
      await ctx.db.order.update({
        where: {
          id: input.orderID,
          driverId: null,
        },
        data: {
          driverId: ctx.session.user.id,
        },
      });
    }),
  currentDelivery: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.userType !== "DRIVER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to access this resource",
      });
    }
    return await ctx.db.order.findFirst({
      where: {
        driverId: ctx.session.user.id,
        status: "CONFIRMED",
      },
      include: {
        productOrder: {
          include: { product: { include: { Store: true } } },
        },
        address: true,
      },
    });
  }),
  pastDeliveries: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.userType !== "DRIVER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to access this resource",
      });
    }
    return await ctx.db.order.findMany({
      where: {
        driverId: ctx.session.user.id,
        status: "DELIVERED",
      },
    });
  }),
});
