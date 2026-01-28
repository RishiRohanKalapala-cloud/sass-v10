"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Domain = {
  id: string;
  name: string;
};

export default function NewPage() {
  const router = useRouter();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainId, setDomainId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/domains/list")
      .then((res) => res.json())
      .then(setDomains);
  }, []);

  const createPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        content,
        domainId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create page");
      setLoading(false);
      return;
    }

    router.push("/dashboard/pages");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Page</h1>

      <form onSubmit={createPage} className="space-y-4">
        <select
          value={domainId}
          onChange={(e) => setDomainId(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        >
          <option value="">Select domain</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Page title"
          className="w-full border rounded-md p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          placeholder="Slug (about, contact)"
          className="w-full border rounded-md p-2"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        {/* Markdown Editor */}
        <div className="grid grid-cols-2 gap-4">
          <textarea
            placeholder="Write Markdown here..."
            className="border rounded-md p-3 min-h-[300px] font-mono"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="border rounded-md p-3 min-h-[300px] bg-muted prose max-w-none overflow-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || "Nothing to preview yet…"}
            </ReactMarkdown>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          {loading ? "Creating..." : "Create Page"}
        </button>
      </form>
    </div>
  );
}
