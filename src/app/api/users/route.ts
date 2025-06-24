import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  });
  return NextResponse.json(users);
}