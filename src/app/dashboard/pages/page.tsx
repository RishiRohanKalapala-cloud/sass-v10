"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Page = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  domain: { name: string };
};

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/pages/list");
    const data = await res.json();
    setPages(data);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (pageId: string) => {
    setLoadingId(pageId);
    await fetch("/api/pages/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId }),
    });
    setLoadingId(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link
          href="/dashboard/pages/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          New Page
        </Link>
      </div>

      <div className="space-y-2">
        {pages.map((p) => (
          <div
            key={p.id}
            className="border rounded-md p-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-muted-foreground">
                {p.domain.name}/{p.slug}
              </p>
            </div>

            <button
              onClick={() => togglePublish(p.id)}
              disabled={loadingId === p.id}
              className={`px-3 py-1 rounded-md text-sm ${
                p.published
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {loadingId === p.id
                ? "Updating..."
                : p.published
                ? "Published"
                : "Draft"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
