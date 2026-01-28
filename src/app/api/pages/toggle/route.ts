import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { pageId } = await req.json();
    if (!pageId) {
      return NextResponse.json({ error: "pageId required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure page belongs to the user via domain
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        domain: { userId: user.id },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: { published: !page.published },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("toggle publish error", e);
    return NextResponse.json(
      { error: "Failed to toggle publish" },
      { status: 500 }
    );
  }
}
