import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-32 text-center">
      <span className="font-mono text-sm text-signal">404</span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-3 text-sm text-slate">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white font-display font-semibold px-6 py-3"
      >
        Back to Home
      </Link>
    </div>
  );
}
