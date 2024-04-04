import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { upload_base64_image } from "~/utils/upload";

export const storeRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        storeID: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const store = await ctx.db.store.findUnique({
        where: {
          id: input.storeID,
        },
      });
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }
      return store;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        address: z.string().min(3),
        lat: z.string(),
        lng: z.string(),
        Logo: z.string(),
        userID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // only admin can create store and assign seller
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      if (!user || user.userType !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to create store",
        });
      }

      const image = await upload_base64_image(input.Logo);

      await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: input.userID },
          data: { userType: "SELLER" },
        }),
        ctx.db.store.create({
          data: {
            name: input.name,
            address: input.address,
            lat: input.lat,
            lng: input.lng,
            Logo: image,
            sellerId: input.userID,
          },
        }),
      ]);
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        address: z.string().min(3).optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
        Logo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.db.store.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }
      if (
        store.sellerId !== ctx.session.user.id &&
        ctx.session.user.userType !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this store",
        });
      }
      let image = undefined;
      if (input.Logo) {
        image = await upload_base64_image(input.Logo);
      }
      return ctx.db.store.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          address: input.address,
          lat: input.lat,
          lng: input.lng,
          Logo: image,
        },
      });
    }),

  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const store = await ctx.db.store.findUnique({
      where: {
        sellerId: ctx.session.user.id,
      },
    });
    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    const orders = await ctx.db.order.findMany({
      where: {
        productOrder: {
          some: {
            product: {
              storeId: store.id,
            },
          },
        },
      },
      include: {
        productOrder: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let monthlyOrders = 0;

    const month = new Date().getMonth();

    for (const order of orders) {
      if (order.createdAt.getMonth() === month) monthlyOrders++;

      for (const productOrder of order.productOrder) {
        if (productOrder.product.storeId !== store.id) continue;
        totalRevenue += productOrder.product.price * productOrder.quantity;
        if (order.createdAt.getMonth() === month) {
          monthlyRevenue += productOrder.product.price * productOrder.quantity;
        }
      }
    }

    return {
      totalOrders: orders.length,
      totalRevenue,
      monthlyRevenue,
      monthlyOrders,
    };
  }),
  top5Products: protectedProcedure.query(async ({ ctx }) => {
    const store = await ctx.db.store.findUnique({
      where: {
        sellerId: ctx.session.user.id,
      },
    });
    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    const products = await ctx.db.$queryRaw<
      Array<{
        product_id: string;
        product_name: string;
        total_quantity_sold: number;
      }>
    >`
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    SUM(po.quantity) AS total_quantity_sold
  FROM
    public."Product" p
  JOIN
    public."productOrder" po ON p.id = po."productId"
  WHERE
    p."storeId" = ${store.id}
  group by p.id, p.name
  order by
    total_quantity_sold desc
  limit 5`;

    return products;
  }),

  OrdersCount: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Parmitize this query to accept 2 dates

    const store = await ctx.db.store.findUnique({
      where: {
        sellerId: ctx.session.user.id,
      },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    const gte = new Date();
    gte.setMonth(gte.getMonth() - 11, 1);
    gte.setHours(0, 0, 0, 0);

    const orders = await ctx.db.order.findMany({
      where: {
        createdAt: {
          gte: gte,
        },
        productOrder: {
          some: {
            product: {
              storeId: store.id,
            },
          },
        },
      },
    });

    const ordersCounts = [];

    for (let i = 0; i < 12; i++) {
      let month = new Date().getMonth() - i;
      if (month < 0) {
        month += 12;
      }

      const monthOrders = orders.filter(
        (order) => order.createdAt.getMonth() === month,
      );

      ordersCounts.push({
        month,
        count: monthOrders.length,
      });
    }
    return ordersCounts;
  }),
  orders: protectedProcedure.query(async ({ ctx }) => {
    const store = await ctx.db.store.findUnique({
      where: {
        sellerId: ctx.session.user.id,
      },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    const orders = await ctx.db.order.findMany({
      where: {
        productOrder: {
          some: {
            product: {
              storeId: store.id,
            },
          },
        },
      },
      include: {
        productOrder: {
          include: {
            product: true,
          },
        },
        user: true,
        address: true,
      },
    });
    return orders.map((order) => ({
      ...order,
      productOrder: order.productOrder.filter(
        (p) => p.product.storeId === store.id,
      ),
    }));
  }),
  lastSales: protectedProcedure.query(async ({ ctx }) => {
    const store = await ctx.db.store.findUnique({
      where: {
        sellerId: ctx.session.user.id,
      },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    const orders = await ctx.db.order.findMany({
      where: {
        productOrder: {
          some: {
            product: {
              storeId: store.id,
            },
          },
        },
        createdAt: {
          gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        productOrder: {
          include: {
            product: true,
          },
        },
      },
    });

    let lastWeekSales = 0;
    let lastMonthSales = 0;

    for (const order of orders) {
      for (const productOrder of order.productOrder) {
        if (productOrder.product.storeId !== store.id) continue;
        lastMonthSales += productOrder.product.price * productOrder.quantity;
        if (
          order.createdAt.getTime() >
          new Date().getTime() - 7 * 24 * 60 * 60 * 1000 // 7 days
        ) {
          lastWeekSales += productOrder.product.price * productOrder.quantity;
        }
      }
    }
    return {
      lastWeekSales,
      lastMonthSales,
    };
  }),
  products: protectedProcedure.query(async ({ ctx }) => {
    const store = await ctx.db.store.findUnique({
      where: {
        sellerId: ctx.session.user.id,
      },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    return ctx.db.product.findMany({
      where: {
        storeId: store.id,
      },
      include: {
        images: true,
        productOrder: {
          select: {
            quantity: true,
            price: true,
          },
        },
        Subcategory: true,
      },
    });
  }),
  setProductStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["VISIBLE", "HIDDEN"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.db.store.findUnique({
        where: {
          sellerId: ctx.session.user.id,
        },
      });

      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      return ctx.db.product.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    }),
  product: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const store = await ctx.db.store.findUnique({
        where: {
          sellerId: ctx.session.user.id,
        },
      });

      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      return ctx.db.product.findUnique({
        where: {
          storeId: store.id,
          id: input.id,
        },
        include: {
          Subcategory: true,
          images: true,
        },
      });
    }),
});
