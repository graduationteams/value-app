import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";

import { authOptions } from "~/server/auth";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return NextAuth(req, res, authOptions(req, res));
};

export default handler;
