"use client";

import { useEffect, useState } from "react";

type Domain = {
  id: string;
  name: string;
  verified: boolean;
};

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      const res = await fetch("/api/domains/list");
      
      if (!res.ok) {
        // If not ok, try to get error message
        const text = await res.text();
        try {
          const errorData = JSON.parse(text);
          setError(errorData.error || "Failed to fetch domains");
        } catch {
          setError("Failed to fetch domains");
        }
        setDomains([]);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setError("Invalid response from server");
        setDomains([]);
        return;
      }

      const data = await res.json();
      setDomains(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching domains:", error);
      setError("Failed to fetch domains");
      setDomains([]);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const domainName = domain.trim();
      
      if (!domainName) {
        setError("Please enter a domain name");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: domainName }),
      });

      const contentType = res.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!res.ok) {
        if (isJson) {
          const data = await res.json();
          setError(data.error || "Failed to add domain");
        } else {
          const text = await res.text();
          setError("Failed to add domain. Please try again.");
          console.error("Non-JSON error response:", text);
        }
        setLoading(false);
        return;
      }

      // Success - parse response and refresh list
      if (isJson) {
        const newDomain = await res.json();
        console.log("Domain created successfully:", newDomain);
        
        // Clear input and refresh list
        setDomain("");
        // Refresh the domains list
        await fetchDomains();
      } else {
        // If response is not JSON but status is OK, still refresh
        setDomain("");
        await fetchDomains();
      }
    } catch (error) {
      console.error("Error adding domain:", error);
      setError("Failed to add domain. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Domains</h1>

      <form onSubmit={addDomain} className="flex gap-2">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="flex-1 border rounded-md p-2"
          required
        />
        <button
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 rounded-md"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {domains.length === 0 && !error ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">
            No domains yet. Add your first domain above!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {domains.map((d) => (
            <div
              key={d.id}
              className="border rounded-md p-3 flex justify-between items-center"
            >
              <span className="font-medium">{d.name}</span>
              <span className={`text-sm px-2 py-1 rounded ${
                d.verified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {d.verified ? "Verified" : "Not verified"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
