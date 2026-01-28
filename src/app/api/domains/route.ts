import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Domain name is required" },
        { status: 400 }
      );
    }

    // ✅ FIX 1: cookies() MUST be awaited in Next.js 16
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(key: string) {
            return cookieStore.get(key)?.value;
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const domainName = name.trim().toLowerCase();

    // ✅ FIX 2: Ensure Prisma user ALWAYS exists
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
      },
    });

    const domain = await prisma.domain.create({
      data: {
        name: domainName,
        userId: user.id,
        verified: false,
      },
    });

    return NextResponse.json(domain, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/domains error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Domain already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create domain" },
      { status: 500 }
    );
  }
}
