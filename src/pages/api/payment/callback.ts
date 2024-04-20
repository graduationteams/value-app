import { appRouter } from "@/server/api/root";
import { createTRPCCaller } from "@/server/api/trpc";
import { db } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).end();
    return;
  }
  console.log("save payemt id", id);

  const payment = await db.payment.findUnique({
    where: {
      id,
    },
  });

  if (!payment) {
    res.status(404).send(`
    <html>
      <body>
      <p>Faild to confirm your order, please contact support</p>
      <p>You will be redirected after 5 seconds</p>
      <script>
          var timer = setTimeout(function() {
            window.location.pathname='/'
          }, 5000);
      </script>
  </body>
  </html>
    `);
    return;
  }

  const createCaller = createTRPCCaller(appRouter);

  const caller = createCaller({
    db,
    req,
    res,
    session: null,
  });

  try {
    await caller.order.confirm({ orderID: payment.orderId });
    res.redirect("/orders");
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).send(`
    <html>
      <body>
      <p>Faild to confirm your order, please contact support</p>
      <p>You will be redirected after 5 seconds</p>
      <script>
          var timer = setTimeout(function() {
            window.location.pathname='/'
          }, 5000);
      </script>
  </body>
  </html>
    `);

    return;
  }
}
