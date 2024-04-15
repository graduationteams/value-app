// src/server/api/routers/addcategory.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const addCategoryRouter = createTRPCRouter({
  addCategory: publicProcedure
    .input(
      z.object({
        name: z.string(),
        categoryType: z.enum(["FARM", "REGULAR"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, categoryType } = input;
      try {
        const newCategory = await ctx.db.category.create({
          data: {
            name,
            categoryType,
            image: "",
          },
        });
        return newCategory;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Handle known errors here, e.g., unique constraint violation
          if (error.code === "P2002") {
            throw new Error("A category with this name already exists");
          }
        }
        // For unexpected errors, rethrow them or handle them as you see fit
        throw error;
      }
    }),
});
