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
        // we will use imagebb for hosting images, it's free but we might need to change it in the future to something else (like s3 or cloudinary)
        const form = new FormData();
        // base64 string start with `data:image/png;base64,...actualBase64String...` so we need to remove the `data:image/png;base64,` part since imgbb doesn't accept it
        const base64String = input.profilePicture.split(",")[1];
        if (!base64String) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid base64 string",
          });
        }
        form.append("image", base64String);
        try {
          const res = await fetch(
            "https://api.imgbb.com/1/upload?key=" + env.IMGBB_API_KEY,
            {
              method: "POST",
              body: form,
            },
          );
          const data = (await res.json()) as {
            data?: { image?: { url?: string } };
          };
          if (!res.ok) {
            throw new Error("Failed to upload image" + JSON.stringify(data));
          }
          if (data.data?.image?.url) {
            imageUrl = data.data.image.url;
          } else {
            throw new Error("Failed to upload image " + JSON.stringify(data));
          }
        } catch (error) {
          console.error(error);
          if (error instanceof Error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
              cause: error,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload image",
            cause: error,
          });
        }
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
