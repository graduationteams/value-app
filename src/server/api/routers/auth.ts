import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import Cookies from "cookies";
import { randomUUID } from "crypto";
import { z } from "zod";
import { env } from "~/env";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { upload_base64_image } from "~/utils/upload";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(3),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await hash(input.password, 10);
      let userId: string;
      try {
        userId = await ctx.db.$transaction(async (tx) => {
          const { id: userId } = await tx.user.create({
            data: {
              email: input.email,
              name: input.name,
              password: hashedPassword,
              userType: "USER",
            },
          });

          await tx.account.create({
            data: {
              userId: userId,
              type: "credentials",
              provider: "credentials",
              providerAccountId: userId,
            },
          });

          return userId;
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create user",
          cause: error,
        });
      }
      const sessionToken = randomUUID();
      const sessionMaxAge = 60 * 60 * 24 * 30; //30Days
      const sessionExpiry = new Date(Date.now() + sessionMaxAge * 1000);

      await ctx.db.session.create({
        data: {
          sessionToken: sessionToken,
          userId: userId,
          expires: sessionExpiry,
        },
      });

      const cookies = new Cookies(ctx.req, ctx.res);

      cookies.set("next-auth.session-token", sessionToken, {
        expires: sessionExpiry,
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).nullish(),
        profilePicture: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let imageUrl: string | undefined = undefined;
      if (input.profilePicture) {
        imageUrl = await upload_base64_image(input.profilePicture);
      }
      return await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name ?? undefined,
          image: imageUrl,
        },
      });
    }),
});
