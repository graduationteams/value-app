
// src/server/api/routers/getproductstype.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from 'zod'; 
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export const categoriesRouter = createTRPCRouter({
  getByType: publicProcedure
    .input(z.object({ categoryType: z.enum(['FARM', 'REGULAR']) })) 
    .query(async ({ input }) => {
      const { categoryType } = input;
      const categories = await prisma.category.findMany({
        where: {
          categoryType,
        },
      });
      return categories;
    }),
});



