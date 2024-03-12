import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const cartRouter = createTRPCRouter({
  add: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.db.cart.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!cart) {
        return await ctx.db.cart.create({
          data: {
            userId: ctx.session.user.id,
            products: {
              create: {
                productId: input.productId,
                quantity: 1,
              },
            },
          },
          include: {
            products: true,
          },
        });
      }

      return await ctx.db.cart.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          products: {
            upsert: {
              where: {
                product_cart_unique: {
                  productId: input.productId,
                  cartId: cart.id,
                },
              },
              create: {
                productId: input.productId,
                quantity: 1,
              },
              update: {
                quantity: {
                  increment: 1,
                },
              },
            },
          },
        },
        include: {
          products: true,
        },
      });
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.cart.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        products: true,
      },
    });
  }),

  decrement: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.db.cart.findUniqueOrThrow({
        where: {
          userId: ctx.session.user.id,
        },
      });

      const product = await ctx.db.cartProduct.findUniqueOrThrow({
        where: {
          product_cart_unique: {
            productId: input.productId,
            cartId: cart.id,
          },
        },
      });
      if (product.quantity <= 1) {
        return await ctx.db.cart.update({
          where: { userId: ctx.session.user.id },
          data: {
            products: {
              delete: {
                product_cart_unique: {
                  cartId: cart.id,
                  productId: input.productId,
                },
              },
            },
          },
          include: {
            products: true,
          },
        });
      }

      return await ctx.db.cart.update({
        where: { userId: ctx.session.user.id },
        data: {
          products: {
            update: {
              where: {
                product_cart_unique: {
                  cartId: cart.id,
                  productId: input.productId,
                },
              },
              data: {
                quantity: {
                  decrement: 1,
                },
              },
            },
          },
        },
        include: {
          products: true,
        },
      });
    }),
});
