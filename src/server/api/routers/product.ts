import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { upload_base64_image } from "~/utils/upload";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string(),
        price: z.number().positive(),
        images: z.array(z.string()),
        categoryID: z.string(),
        isGroupBuying: z.boolean().optional(),
        requiredParticipants: z.number().positive().optional(),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.isGroupBuying &&
        (!input.requiredParticipants || !input.endDate)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "requiredParticipants and endDate is required for group buying",
        });
      }

      // check if the storeId is valid and belongs to the current user
      const storeid = await ctx.db.store.findUnique({
        where: {
          sellerId: ctx.session.user.id,
        },
      });
      if (!storeid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to create product for this store",
        });
      }

      const images = await Promise.all(
        input.images.map(async (image) => {
          return upload_base64_image(image);
        }),
      );

      const product = await ctx.db.product.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          images: {
            create: images.map((url) => {
              return { url };
            }),
          },
          subcategoryId: input.categoryID,
          storeId: storeid.id,
          is_group_buy: input.isGroupBuying,
          required_qty: input.requiredParticipants,
          group_buy_end: input.endDate,
        },
      });
      return product;
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        description: z.string().min(3).optional(),
        price: z.number().positive().optional(),
        images: z
          .array(
            z.object({
              type: z.enum(["url", "base64"]),
              value: z.string(),
            }),
          )
          .optional(),
        categoryID: z.string().optional(),
        endDate: z.date().optional(),
        requiredOrders: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // check if the storeId is valid and belongs to the current user
      const store = await ctx.db.product.findUnique({
        where: {
          id: input.id,
          Store: {
            sellerId: ctx.session.user.id,
          },
        },
        select: {
          storeId: true,
        },
      });
      if (!store) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this product",
        });
      }
      let images: string[] | undefined = undefined;
      if (input.images) {
        //delete old images
        await ctx.db.image.deleteMany({
          where: {
            productId: input.id,
          },
        });

        images = await Promise.all(
          input.images.map(async (image) => {
            if (image.type === "url") {
              return image.value;
            }
            return upload_base64_image(image.value);
          }),
        );
      }
      await ctx.db.product.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name ?? undefined,
          description: input.description ?? undefined,
          price: input.price ?? undefined,
          images: {
            create: images?.map((url) => {
              return { url };
            }),
          },
          subcategoryId: input.categoryID ?? undefined,
          required_qty: input.requiredOrders,
          group_buy_end: input.endDate,
        },
      });
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(3),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.product.findMany({
        where: {
          name: {
            contains: `%${input.query}%`,
            mode: "insensitive",
          },
        },
        include: {
          Store: true,
          images: true,
        },
      });
    }),
  getGroupBuy: publicProcedure
    .input(
      z
        .object({
          take: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const productsRaw = await ctx.db.$queryRaw<
        {
          currentorders: number;
          id: string;
          name: string;
          description: string;
          price: number;
          storeId: string;
          status: string;
          subcategoryId: string;
          group_buy_end: string;
          group_buy_status: string;
          is_group_buy: boolean;
          required_qty: number;
          url: string;
          storeName: string;
          Logo: string;
        }[]
      >`
        SELECT SUM(po.quantity) AS currentOrders,
        p.id,
        p.name,
        description,
        p.price,
        "storeId",
        status,
        "subcategoryId",
        group_buy_end,
        group_buy_status,
        is_group_buy,
        required_qty,
        i.url,
        S.name AS storeName,
        S."Logo"
  FROM "Product" p
  LEFT JOIN "productOrder" po ON p.id = po."productId"
  JOIN "Image" I ON p.id = I."productId"
  JOIN "Store" S ON S.id = p."storeId"
  WHERE p.id IN
      (SELECT id
      FROM "Product"
      WHERE status = 'VISIBLE'
        AND is_group_buy = TRUE
        AND group_buy_status = 'OPEN'
        AND group_buy_end > now()
      ORDER BY id
      LIMIT ${input?.take ?? 999999999999})
  GROUP BY p.id,
          p.name,
          i.url,
          S.name,
          S."Logo"
  ORDER BY p.id;
      `;
      const products: Record<
        string,
        {
          currentorders: number;
          id: string;
          name: string;
          description: string;
          price: number;
          storeId: string;
          status: string;
          subcategoryId: string;
          group_buy_end: Date;
          group_buy_status: string;
          is_group_buy: boolean;
          required_qty: number;
          images: string[];
          storeName: string;
          Logo: string;
        }
      > = {};
      for (const product of productsRaw) {
        const end = new Date(product.group_buy_end);
        if (end < new Date()) {
          continue;
        }
        const prod = products[product.id];
        if (prod) {
          prod.images.push(product.url);
        } else {
          products[product.id] = {
            ...product,
            images: [product.url],
            group_buy_end: end,
          };
        }
      }
      return Object.values(products);
    }),
});
