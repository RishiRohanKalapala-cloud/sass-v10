import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, content, domainId } = body;

    // Validate input
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    if (!domainId || typeof domainId !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric, hyphens, underscores only)
    const slugRegex = /^[a-z0-9-_]+$/;
    const normalizedSlug = slug.trim().toLowerCase();
    if (!slugRegex.test(normalizedSlug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the domain belongs to the user
    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
        userId: user.id,
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found or unauthorized" },
        { status: 403 }
      );
    }

    // Create page in Prisma
    try {
      const page = await prisma.page.create({
        data: {
          title: title.trim(),
          slug: normalizedSlug,
          content: content || "", // Allow empty content
          domainId,
          published: false, // Default to false
        },
      });

      console.log("Page created successfully:", page.id);
      return NextResponse.json(page, { status: 201 });
    } catch (prismaError: any) {
      console.error("Prisma error:", prismaError);
      
      // Handle unique constraint violation (slug already exists for this domain)
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "Page with this slug already exists for this domain" },
          { status: 409 }
        );
      }

      // Handle foreign key constraint
      if (prismaError.code === "P2003") {
        return NextResponse.json(
          { error: "Domain not found" },
          { status: 404 }
        );
      }

      throw prismaError;
    }
  } catch (error: any) {
    console.error("Error in POST /api/pages:", error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: "Failed to create page",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
