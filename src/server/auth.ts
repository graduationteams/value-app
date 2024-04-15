import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { User as PUser } from "@prisma/client";
import { type NextApiRequest, type NextApiResponse } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialProvider from "next-auth/providers/credentials";
import { randomUUID } from "crypto";
import Cookies from "cookies";
import { decode, encode } from "next-auth/jwt";

import { env } from "~/env";
import { db } from "~/server/db";
import { compare } from "bcrypt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      userType: PUser["userType"];
      phone: PUser["phone"];
      isPassword: boolean;
    };
  }
  interface User {
    userType: PUser["userType"];
    password: PUser["password"];
    phone: PUser["phone"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: (
  req: NextApiRequest,
  res: NextApiResponse,
) => NextAuthOptions = (req, res) => {
  const adapter = PrismaAdapter(db);

  return {
    callbacks: {
      session: ({ session, user }) => {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            userType: user.userType,
            isPassword: user.password !== null,
            phone: user.phone,
          },
        };
      },
      async signIn({ user }) {
        // Check if this sign in callback is being called in the credentials authentication flow. If so, use the next-auth adapter to create a session entry in the database (SignIn is called after authorize so we can safely assume the user is valid and already authenticated).
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth?.includes("credentials") &&
          req.method === "POST"
        ) {
          if (user) {
            const sessionToken = randomUUID();
            const sessionMaxAge = 60 * 60 * 24 * 30; //30Days
            const sessionExpiry = new Date(Date.now() + sessionMaxAge * 1000);

            await adapter.createSession?.({
              sessionToken: sessionToken,
              userId: user.id,
              expires: sessionExpiry,
            });

            const cookies = new Cookies(req, res);

            cookies.set("next-auth.session-token", sessionToken, {
              expires: sessionExpiry,
            });
          }
        }

        return true;
      },
    },
    jwt: {
      encode: async ({ token, secret, maxAge }) => {
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth.includes("credentials") &&
          req.method === "POST"
        ) {
          const cookies = new Cookies(req, res);
          const cookie = cookies.get("next-auth.session-token");
          if (cookie) return cookie;
          else return "";
        }
        // Revert to default behaviour when not in the credentials provider callback flow
        return encode({ token, secret, maxAge });
      },
      decode: async ({ token, secret }) => {
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth.includes("credentials") &&
          req.method === "POST"
        ) {
          return null;
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return decode({ token, secret });
      },
    },
    adapter,
    providers: [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      CredentialProvider({
        name: "CredentialProvider",
        credentials: {
          email: { label: "Email", type: "text", placeholder: "jsmith" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials) return null;
          // verifying if credential email exists on db
          const user = await db.user.findUnique({
            where: {
              email: credentials?.email,
            },
          });

          if (!user) return null;

          if (user.password === null) return null;
          const isPasswordValid = await compare(
            credentials.password,
            user.password,
          );
          if (!isPasswordValid) return null;

          return {
            ...user,
            isPassword: user.password !== null,
          };
        },
      }),
      /**
       * ...add more providers here.
       *
       * Most other providers require a bit more work than the Discord provider. For example, the
       * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
       * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
       *
       * @see https://next-auth.js.org/providers/github
       */
    ],
  };
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions(ctx.req, ctx.res));
};
