import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { upload_base64_image } from "~/utils/upload";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().min(3),
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
      return (
        await ctx.db.product.findMany({
          where: {
            status: "VISIBLE",
            is_group_buy: true,
            group_buy_status: "OPEN",
          },
          include: {
            productOrder: true,
            Store: true,
            images: true,
          },
          take: input?.take,
        })
      ).map((product) => ({
        ...product,
        currentOrders: product.productOrder.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        ),
        productOrder: undefined,
      }));
    }),
});
