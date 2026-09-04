"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiRequestError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      router.push(user.role === "student" ? "/dashboard" : "/admin");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-display text-3xl font-semibold text-ink text-center">Student Login</h1>
      <p className="mt-2 text-sm text-slate text-center">Access your courses, attendance and certificates.</p>

      <form onSubmit={handleSubmit} className="mt-8 bg-white border border-blueprint/10 p-6 space-y-4">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-blueprint/20 px-4 py-3 text-sm focus:border-signal focus:outline-none"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-blueprint/20 px-4 py-3 text-sm focus:border-signal focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark disabled:opacity-60 text-white font-display font-semibold py-3 transition-colors"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Log In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        New student?{" "}
        <Link href="/register" className="text-blueprint font-semibold hover:text-signal">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate">
        Institute staff/admin?{" "}
        <Link href="/admin/login" className="text-blueprint font-semibold hover:text-signal">
          Admin login
        </Link>
      </p>
    </div>
  );
}
