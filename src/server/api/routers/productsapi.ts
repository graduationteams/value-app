// src/server/api/routers/products.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { STORE_DISTENCE_LIMIT_IN_KM } from "@/lib/constants.server";

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
        cursor: z.string().nullish(),
        longitude: z.number().optional(),
        latitude: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      let stores:
        | undefined
        | Array<{
            id: string;
            dist_km: number;
          }>;
      if (input.longitude && input.latitude) {
        stores = await ctx.db.$queryRaw<
          Array<{
            id: string;
            dist_km: number;
          }>
        >`select id,dist_km from nearby_Stores(${input.latitude},${input.longitude}) where dist_km <= ${STORE_DISTENCE_LIMIT_IN_KM};`;
      }

      const { subcategoryId } = input;
      const limit = 10;
      const products = await ctx.db.product.findMany({
        where: {
          Subcategory: {
            id: subcategoryId,
            Category: {
              name: input.categoryName,
            },
          },
          storeId: stores
            ? {
                in: stores.map((w) => w.id),
              }
            : undefined,
          status: "VISIBLE",
          is_group_buy: false,
        },
        include: {
          images: true,
          Subcategory: true,
          Store: true,
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          id: "asc",
        },
      });
      let nextCursor: string | undefined = undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }
      return {
        products,
        nextCursor,
      };
    }),

  // get BY ID
  getByIds: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()), // Array of product IDs expected
      }),
    )
    .query(async ({ input, ctx }) => {
      const { ids } = input;
      const products = await ctx.db.product.findMany({
        where: {
          id: {
            in: ids, // Using Prisma's `in` query to find products with IDs in the given array
          },
          status: "VISIBLE",
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
