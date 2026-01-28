import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <h1 className="text-4xl font-bold">
        SaaS CMS Platform
      </h1>

      <p className="max-w-xl text-muted-foreground">
        A domain-based publishing platform where users can create and publish
        pages directly on their own custom domains.
      </p>

      <div className="flex gap-4">
        <Link
          href="/signup"
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground"
        >
          Get Started
        </Link>

        <Link
          href="/login"
          className="px-6 py-2 rounded-md border"
        >
          Login
        </Link>

        <Link
          href="/dashboard"
          className="px-6 py-2 rounded-md border"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
