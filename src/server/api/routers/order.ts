import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// TODO: calculate delivery amount based on the distance between the store and the user address
const DELIVERY_AMOUNT = 30;

/* 
  order flow 
  1. create order with status "CREATED"
  2. when a payment is made, update the order status to "CONFIRMED" and assaign a driver to the order
  3. after the driver delivers the order, update the order status to "DELIVERED"
*/

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        addressID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.db.cart.findUniqueOrThrow({
        where: { userId: ctx.session.user.id },
        include: {
          products: {
            include: { product: true },
          },
        },
      });

      let total = 0;
      for (const cartProduct of cart.products) {
        total += cartProduct.product.price * cartProduct.quantity;
      }
      const [order] = await ctx.db.$transaction([
        ctx.db.order.create({
          data: {
            status: "CREATED",
            deliveryAmount: DELIVERY_AMOUNT,
            totalAmount: total + DELIVERY_AMOUNT,
            address: {
              connect: {
                id: input.addressID,
              },
            },
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            productOrder: {
              createMany: {
                data: cart.products.map((cartProduct) => ({
                  price: cartProduct.product.price,
                  quantity: cartProduct.quantity,
                  productId: cartProduct.productId,
                })),
              },
            },
          },
        }),
        ctx.db.cartProduct.deleteMany({
          where: {
            cartId: cart.id,
          },
        }),
      ]);

      return order;
    }),
  confirm: protectedProcedure
    .input(
      z.object({
        orderID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //this is route will be called as callback from the payment gateway after the payment is made
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
      if (order.status !== "CREATED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order status is not CREATED",
        });
      }

      //TODO: confirm the payment from the payment gateway (for now we will just assume the payment is confirmed)

      // TODO: assign a driver to the order and send a notification to the driver

      const updatedOrder = await ctx.db.order.update({
        where: {
          id: input.orderID,
        },
        data: {
          status: "CONFIRMED",
        },
      });
      return updatedOrder;
    }),
  confirmDelivery: protectedProcedure
    .input(
      z.object({
        orderID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //this is route will be called by the driver when he delivers the order to the user
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
      if (order.driverId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not the driver of this order",
        });
      }
      await ctx.db.order.update({
        where: {
          id: input.orderID,
        },
        data: {
          status: "DELIVERED",
        },
      });
    }),
  getUserOrders: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.order.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        address: true,
        driver: true,
        productOrder: {
          include: {
            product: true,
          },
        },
      },
    });
  }),
  cancel: protectedProcedure
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
      if (order.status !== "CREATED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "can't cancel order with status " + order.status,
        });
      }
      if (
        order.userId !== ctx.session.user.id &&
        ctx.session.user.userType !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not the owner of this order",
        });
      }
      await ctx.db.order.update({
        where: {
          id: input.orderID,
        },
        data: {
          status: "CANCELLED",
        },
      });
    }),
});
