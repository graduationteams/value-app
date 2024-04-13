import { db } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  _res: NextApiResponse,
) {
  const currentDate = new Date();

  const products = await db.product.findMany({
    where: {
      group_buy_end: {
        lte: currentDate,
      },
      is_group_buy: true,
      group_buy_status: "OPEN",
    },
    include: {
      productOrder: true,
    },
  });

  for (const product of products) {
    const currentOrders = product.productOrder.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    if (!product.required_qty) {
      console.error(`Product ${product.id} is missing required_qty`);
      continue;
    }
    if (currentOrders >= product.required_qty) {
      // group buy finished successfully
      await db.$transaction([
        db.product.update({
          where: {
            id: product.id,
            is_group_buy: true,
          },
          data: {
            group_buy_status: "FINISHED",
          },
        }),
        db.order.updateMany({
          where: {
            productOrder: {
              some: {
                productId: product.id,
              },
            },
            status: "PAID",
          },
          data: {
            status: "CONFIRMED",
          },
        }),
      ]);
    } else {
      // group buy failed
      await db.$transaction([
        db.product.update({
          where: {
            id: product.id,
            is_group_buy: true,
          },
          data: {
            group_buy_status: "CANCELLED",
          },
        }),
        db.order.updateMany({
          where: {
            productOrder: {
              some: {
                productId: product.id,
              },
            },
            // TODO: refund should happen by the cron job for cancelld orders
            status: "PAID",
          },
          data: {
            status: "CANCELLED",
          },
        }),
      ]);
    }
  }
  _res.status(200).json({ success: true });
}
