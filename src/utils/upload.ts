import { TRPCError } from "@trpc/server";
import { env } from "~/env";

export async function upload_base64_image(base64String: string) {
  // we will use imagebb for hosting images, it's free but we might need to change it in the future to something else (like s3 or cloudinary)
  const form = new FormData();
  // base64 string start with `data:image/png;base64,...actualBase64String...` so we need to remove the `data:image/png;base64,` part since imgbb doesn't accept it
  const base64 = base64String.split(",")[1];
  if (!base64) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid base64 string",
    });
  }
  form.append("image", base64);
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
    return data.data.image.url;
  } else {
    throw new Error("Failed to upload image " + JSON.stringify(data));
  }
}
