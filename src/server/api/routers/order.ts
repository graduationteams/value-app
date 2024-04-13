import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

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

      if (cart.products.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can't create order with empty cart",
        });
      }

      let total = 0;
      for (const cartProduct of cart.products) {
        if (cartProduct.product.is_group_buy) {
          const participants =
            (
              await ctx.db.productOrder.aggregate({
                where: {
                  productId: cartProduct.productId,
                },
                _sum: { quantity: true },
              })
            )._sum.quantity ?? 0;
          const tobuy = cartProduct.quantity;
          if (participants + tobuy > (cartProduct.product.required_qty ?? 0)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cant buy more than required qty for group buy product",
            });
          }
        }
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
      // this is route will be called as callback from the payment gateway after the payment is made
      const order = await ctx.db.order.findUnique({
        where: {
          id: input.orderID,
        },
        include: {
          productOrder: { include: { product: true } },
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

      await ctx.db.order.update({
        where: {
          id: input.orderID,
        },
        data: {
          status: "PAID",
        },
      });

      let isGroupBuy = false;

      for (const productOrder of order.productOrder) {
        if (productOrder.product.is_group_buy) {
          isGroupBuy = true;
          const participants =
            (
              await ctx.db.productOrder.aggregate({
                where: {
                  productId: productOrder.productId,
                },
                _sum: { quantity: true },
              })
            )._sum.quantity ?? 0;
          if (participants >= (productOrder.product.required_qty ?? 0)) {
            // update all the product orders to confirmed
            await confirmGroupBuy(productOrder.productId, ctx.db);
          }
        }
      }
      if (!isGroupBuy) {
        return ctx.db.order.update({
          where: {
            id: input.orderID,
          },
          data: {
            status: "CONFIRMED",
          },
        });
      }
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

async function confirmGroupBuy(productID: string, db: PrismaClient) {
  const orders = await db.productOrder.findMany({
    where: {
      productId: productID,
      product: {
        is_group_buy: true,
      },
    },
    include: {
      order: true,
      product: true,
    },
  });
  if (orders.length === 0) {
    return;
  }
  const ordersSum = orders.reduce((acc, order) => {
    return acc + order.quantity;
  }, 0);

  if (ordersSum < (orders[0]!.product.required_qty ?? 0)) {
    return;
  }

  await db.order.updateMany({
    where: {
      id: {
        in: orders.map((order) => order.orderId),
      },
      status: "PAID",
    },
    data: {
      status: "CONFIRMED",
    },
  });
}
