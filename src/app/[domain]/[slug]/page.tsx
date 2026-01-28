import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function PublicPage({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const page = await prisma.page.findFirst({
    where: {
      slug: params.slug,
      published: true,
      domain: { name: params.domain },
    },
  });

  if (!page) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>

      <article className="prose prose-neutral max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {page.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
