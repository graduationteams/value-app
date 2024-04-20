import { env } from "@/env";
import { db } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const bodyschema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  status: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("save payemt id");
  const { id, amount, description, status } = bodyschema.parse(req.body);
  let orderId: null | string = null;
  try {
    const paymentObj = (await fetch(
      `https://api.moyasar.com/v1/payments/${id}`,
      {
        headers: {
          Authorization: `Basic ${btoa(env.MOYASER_SECRET_KEY + ":")}`,
        },
      },
    ).then((res) => res.json())) as unknown;

    orderId = z
      .object({ metadata: z.object({ orderId: z.string() }) })
      .parse(paymentObj).metadata.orderId;
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).end();
    return;
  }
  if (!orderId) {
    console.error("No orderId found in payment metadata");
    res.status(500).end();
    return;
  }

  const orderobj = await db.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!orderobj || orderobj.totalAmount * 100 !== amount) {
    console.error("Order not found or amount mismatch");
    res.status(500).end();
    return;
  }

  await db.payment.create({
    data: {
      id,
      amount,
      description,
      status,
      orderId,
    },
  });

  res.status(201).end();
}
