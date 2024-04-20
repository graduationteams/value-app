import { env } from "@/env";
import { z } from "zod";

export async function getPayment(paymentId: string) {
  const paymentObj = (await fetch(
    `https://api.moyasar.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Basic ${btoa(env.MOYASER_SECRET_KEY + ":")}`,
      },
    },
  ).then((res) => res.json())) as unknown;

  const obj = z
    .object({
      metadata: z.object({ orderId: z.string() }),
      status: z.string(),
      id: z.string(),
      amount: z.number(),
      description: z.string(),
    })
    .safeParse(paymentObj);

  if (!obj.success) {
    console.log("Error parsing payment object", obj.error);
    return null;
  }
  return obj.data;
}
