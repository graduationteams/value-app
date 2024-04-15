// src/server/api/routers/products.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const productsRouter = createTRPCRouter({
  // Fetch all products
  all: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: { status: "VISIBLE" }, // Assuming a 'status' field to filter visible products
      include: {
        images: true,
        Subcategory: true,
      },
    });
    return products;
  }),

  // Fetch products by category type (FARM or REGULAR)
  getByCategoryType: publicProcedure
    .input(z.object({ categoryType: z.enum(["FARM", "REGULAR"]) }))
    .query(async ({ input, ctx }) => {
      const { categoryType } = input;
      const products = await ctx.db.product.findMany({
        where: {
          Subcategory: {
            Category: {
              categoryType: categoryType,
            },
          },
        },
        include: {
          images: true,
          Subcategory: true,
        },
      });
      return products;
    }),

  // Fetch products by subcategory ID
  getBySubcategory: publicProcedure
    .input(
      z.object({
        subcategoryId: z.string().optional(),
        categoryName: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { subcategoryId } = input;
      const products = await ctx.db.product.findMany({
        where: {
          Subcategory: {
            id: subcategoryId,
            Category: {
              name: input.categoryName,
            },
          },
          status: "VISIBLE",
          is_group_buy: false,
        },
        include: {
          images: true,
          Subcategory: true,
          Store: true,
        },
      });
      return products;
    }),
});
