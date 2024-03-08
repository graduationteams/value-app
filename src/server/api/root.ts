import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { categoriesRouter } from "~/server/api/routers/getproductstype";
import { authRouter } from "./routers/auth";
import { productRouter } from "./routers/product";
import { storeRouter } from "./routers/store";
import { addCategoryRouter } from '~/server/api/routers/addcategory';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  categories: categoriesRouter,
  auth: authRouter,
  product: productRouter,
  store: storeRouter,
  addCategory: addCategoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
