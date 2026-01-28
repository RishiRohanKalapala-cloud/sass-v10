import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: "Missing user data" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
