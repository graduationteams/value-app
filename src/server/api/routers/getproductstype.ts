// src/server/api/routers/getproductstype.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
export const categoriesRouter = createTRPCRouter({
  getByType: publicProcedure
    .input(z.object({ categoryType: z.enum(["FARM", "REGULAR"]) }))
    .query(async ({ input, ctx }) => {
      const { categoryType } = input;
      const categories = await ctx.db.category.findMany({
        where: {
          categoryType,
        },
      });
      return categories;
    }),
  all: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany();
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
});
