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
        await ctx.db.cart.create({
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
      } else {
        await ctx.db.cart.update({
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
      }

      let recommendations: string[] = [];

      // Asynchronously fetch recommendations after adding a product to the cart
      await fetch(
        "https://recommendv-68e7e51ae774.herokuapp.com/recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: input.productId }),
        },
      )
        .then((response) => response.json())
        .then((fetchedRecommendations) => {
          // Assign the fetched recommendations to the variable
          recommendations = fetchedRecommendations as string[];
          console.log("Fetched Recommendations:", recommendations);
        })
        .catch((error) => {
          console.error("Error fetching recommendations:", error);
        });

      return {
        success: true,
        message: "Product added to cart successfully",
        recommendations: recommendations, // Include the recommendations in the response
      };
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.db.cart.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        products: true,
      },
    });
    return cart;
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
        await ctx.db.cart.update({
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
      } else {
        await ctx.db.cart.update({
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
      }
      return {
        success: true,
        message: "Product quantity decremented successfully",
      };
    }),
});
