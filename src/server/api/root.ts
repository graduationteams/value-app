import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { categoriesRouter } from "~/server/api/routers/getproductstype";
import { authRouter } from "./routers/auth";
import { productRouter } from "./routers/product";
import { storeRouter } from "./routers/store";
import { addCategoryRouter } from "~/server/api/routers/addcategory";
import { orderRouter } from "./routers/order";
import { cartRouter } from "./routers/cart";
import { addressRouter } from "./routers/adrress";
import { driverRouter } from "./routers/driver";
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
  order: orderRouter,
  cart: cartRouter,
  address: addressRouter,
  driver: driverRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
