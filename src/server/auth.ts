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
      picture: PUser["image"];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: PUser["userType"];
    phone: PUser["phone"];
    isPassword: boolean;
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
) => NextAuthOptions = () => {
  const adapter = PrismaAdapter(db);

  return {
    session: {
      strategy: "jwt",
    },
    callbacks: {
      jwt: async ({ token }) => {
        const user = await db.user.findUnique({
          where: {
            id: token.sub,
          },
        });
        if (!user) throw new Error("User not found");

        return {
          ...token,
          userType: user.userType,
          email: user.email,
          id: user.id,
          isPassword: user.password !== null,
          phone: user.phone,
          picture: user.image,
        };
      },
      session: ({ session, token }) => {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            userType: token.userType,
            isPassword: token.password !== null,
            phone: token.phone,
            picture: token.picture,
          },
        };
      },
    },
    adapter,
    providers: [
      GoogleProvider({
        id: "google",
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        httpOptions: { timeout: 40000 },
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
        checks: ["none"],
      }),
      CredentialProvider({
        id: "credentials",
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
