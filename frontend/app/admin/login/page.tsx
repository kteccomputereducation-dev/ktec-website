"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiRequestError } from "@/lib/api";

export default function AdminLoginPage() {
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
      if (user.role !== "admin" && user.role !== "staff") {
        setError("This account does not have admin/staff access.");
        setLoading(false);
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center border-2 border-blueprint text-blueprint mx-auto">
          <ShieldCheck size={22} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Admin / Staff Login</h1>
        <p className="mt-1 text-sm text-slate">K TEC Computer Education control panel</p>
      </div>

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
    </div>
  );
}
