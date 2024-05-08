import { postRouter } from "./routers/post";
import { createTRPCRouter } from "./trpc";
import { categoriesRouter } from "./routers/getproductstype";
import { authRouter } from "./routers/auth";
import { productRouter } from "./routers/product";
import { storeRouter } from "./routers/store";
import { addCategoryRouter } from "./routers/addcategory";
import { orderRouter } from "./routers/order";
import { cartRouter } from "./routers/cart";
import { addressRouter } from "./routers/adrress";
import { driverRouter } from "./routers/driver";
import { productsRouter } from "./routers/productsapi";
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
  products: productsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
