import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
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
        categories: z.array(z.string()).min(1),
        storeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if the storeId is valid and belongs to the current user
      const storeid = await ctx.db.store.findUnique({
        where: {
          id: input.storeId,
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
          categories: {
            connect: input.categories.map((id) => {
              return { id };
            }),
          },
          storeId: input.storeId,
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
        images: z.array(z.string()).optional(),
        categories: z.array(z.string()).min(1).optional(),
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
            return upload_base64_image(image);
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
          categories: {
            set: input.categories?.map((id) => {
              return { id };
            }),
          },
        },
      });
    }),
});
