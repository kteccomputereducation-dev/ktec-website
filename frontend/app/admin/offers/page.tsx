"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { Course } from "@/lib/types";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: "",
    discount_text: "",
    valid_from: "",
    valid_until: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [o, c] = await Promise.all([
      api.get<{ offers: any[] }>("/api/offers/admin/all"),
      api.get<{ courses: Course[] }>("/api/courses/admin/all"),
    ]);
    setOffers(o.offers);
    setCourses(c.courses);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/offers", form);
      setModalOpen(false);
      setForm({ title: "", description: "", course_id: "", discount_text: "", valid_from: "", valid_until: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create offer.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(offer: any) {
    await api.put(`/api/offers/${offer.id}`, { is_active: !offer.is_active });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this offer?")) return;
    await api.delete(`/api/offers/${id}`);
    load();
  }

  const inputClass = "w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Offers</h1>
          <p className="text-sm text-slate mt-1">Manage promotional offers and discounts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus size={16} /> Add Offer
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-sm text-slate">Loading…</p>}
        {!loading && offers.length === 0 && <p className="text-sm text-slate">No offers created yet.</p>}
        {offers.map((o) => (
          <div key={o.id} className="bg-white border border-blueprint/10 p-5">
            <div className="flex items-start justify-between">
              <h3 className="font-display font-semibold text-sm text-ink">{o.title}</h3>
              <button onClick={() => toggleActive(o)} title={o.is_active ? "Deactivate" : "Activate"}>
                {o.is_active ? (
                  <ToggleRight size={22} className="text-signal" />
                ) : (
                  <ToggleLeft size={22} className="text-slate" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate">{o.description}</p>
            <p className="mt-3 font-mono text-xs text-draft-dark">{o.discount_text}</p>
            {o.valid_until && <p className="mt-1 font-mono text-xs text-slate">Until {o.valid_until}</p>}
            <button
              onClick={() => remove(o.id)}
              className="mt-4 inline-flex items-center gap-1 text-xs text-slate hover:text-red-600"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-start justify-center overflow-y-auto p-5">
          <div className="bg-white max-w-md w-full mt-16">
            <div className="flex items-center justify-between border-b border-blueprint/10 p-5">
              <h2 className="font-display font-semibold text-ink">Add Offer</h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <input
                required
                placeholder="Offer Title"
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className={`${inputClass} h-20`}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                className={inputClass}
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <input
                placeholder="Discount Text (e.g. 20% OFF)"
                className={inputClass}
                value={form.discount_text}
                onChange={(e) => setForm({ ...form, discount_text: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className={inputClass}
                  value={form.valid_from}
                  onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                />
                <input
                  type="date"
                  className={inputClass}
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold py-2.5"
              >
                {saving && <Loader2 size={14} className="animate-spin" />} Create Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
