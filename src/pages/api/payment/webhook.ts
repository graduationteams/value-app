import { env } from "@/env";
import { db } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const bodyschema = z.object({
  id: z.string(),
  type: z.string(),
  created_at: z.string(),
  secret_token: z.string(),
  account_name: z.null(),
  live: z.boolean(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.number(),
    description: z.string(),
    metadata: z.object({ orderId: z.string() }),
  }),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("Recived Request with body: ", req.body);

  const data = bodyschema.safeParse(req.body);

  if (!data.success) {
    console.log(data.error);
    res.status(400).end();
    return;
  }

  if (data.data.secret_token !== env.MOYASER_SECRET_Token) {
    console.log("Secret token do not match");
    res.status(401).end();
    return;
  }

  const paymentobj = await db.payment.findUnique({
    where: {
      id: data.data.data.id,
    },
  });

  if (!paymentobj) {
    console.log("Payment not found");
    res.status(404).end();
    return;
  }
  if (data.data.data.amount !== paymentobj.amount) {
    console.log("Amounts do not match");
    res.status(400).end();
    return;
  }
  await db.payment.update({
    where: {
      id: data.data.data.id,
    },
    data: {
      status: data.data.data.status,
    },
  });

  res.status(200).end();
}
