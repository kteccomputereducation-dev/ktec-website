"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/register", form);
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-display text-3xl font-semibold text-ink text-center">Create Student Account</h1>
      <p className="mt-2 text-sm text-slate text-center">Register to access your student dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-8 bg-white border border-blueprint/10 p-6 space-y-4">
        <input
          required
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full border border-blueprint/20 px-4 py-3 text-sm focus:border-signal focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-blueprint/20 px-4 py-3 text-sm focus:border-signal focus:outline-none"
        />
        <input
          required
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-blueprint/20 px-4 py-3 text-sm focus:border-signal focus:outline-none"
        />
        <input
          required
          type="password"
          placeholder="Password (min. 8 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-blueprint/20 px-4 py-3 text-sm focus:border-signal focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark disabled:opacity-60 text-white font-display font-semibold py-3 transition-colors"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        Already have an account?{" "}
        <Link href="/login" className="text-blueprint font-semibold hover:text-signal">
          Log in
        </Link>
      </p>
    </div>
  );
}
