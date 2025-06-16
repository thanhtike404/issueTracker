import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { headers as getHeaders } from "next/headers";
import prisma from "../../../../../prisma/client";
export const dynamic = "force-dynamic"; // ensures it's not cached

export async function POST(req: NextRequest) {
  const payload = await req.arrayBuffer();
  const body = Buffer.from(payload);
  const headersList = getHeaders();

  const svixHeaders = {
    "svix-id": headersList.get("svix-id")!,
    "svix-timestamp": headersList.get("svix-timestamp")!,
    "svix-signature": headersList.get("svix-signature")!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt;
  try {
    evt = wh.verify(body, svixHeaders);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }
//   @ts-ignore
  const { type, data } = evt;

  if (type === "user.created") {
    try {
      const email = data.email_addresses?.[0]?.email_address;

      await prisma.user.create({
        data: {
            clerkId: data.id,
          email,
          name: data.first_name,
          image: data.image_url,
        },
      });

      console.log("User created in DB:", email);
    } catch (err) {
      console.error("Error creating user:", err);
      return new Response("DB error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
