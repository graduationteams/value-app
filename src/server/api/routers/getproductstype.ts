// src/server/api/routers/getproductstype.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
export const categoriesRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: {
        id: "asc",
      },
    });
    return categories;
  }),
  subcategories: publicProcedure.query(async ({ ctx }) => {
    const subcategories = await ctx.db.category.findMany({
      include: {
        subcategories: true,
      },
    });
    return subcategories;
  }),
  subcategory: publicProcedure
    .input(z.object({ categoryName: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const subcategory = await ctx.db.subcategory.findMany({
        where: {
          Category: {
            name: input.categoryName,
          },
        },
      });
      return subcategory;
    }),
});
