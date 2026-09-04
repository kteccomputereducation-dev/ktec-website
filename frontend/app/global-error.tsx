"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center px-5">
          <h1 className="font-display text-2xl font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate">Please try again, or return to the homepage.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="bg-blueprint text-white text-sm font-semibold px-5 py-2.5"
            >
              Try Again
            </button>
            <Link href="/" className="border border-blueprint/30 text-blueprint text-sm font-semibold px-5 py-2.5">
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
