"use client";

import { useEffect, useState } from "react";
import { Search, ArrowRightCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Enquiry } from "@/lib/types";

const STATUS_OPTIONS = ["new", "contacted", "follow_up", "converted", "closed"] as const;
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  converted: "Converted",
  closed: "Closed",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-signal/10 text-signal",
  contacted: "bg-blueprint/10 text-blueprint",
  follow_up: "bg-draft/20 text-draft-dark",
  converted: "bg-green-100 text-green-700",
  closed: "bg-slate/10 text-slate",
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const data = await api.get<{ enquiries: Enquiry[] }>(`/api/enquiries?${params.toString()}`);
    setEnquiries(data.enquiries);
    setLoading(false);
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  async function updateStatus(id: string, status: string) {
    await api.patch(`/api/enquiries/${id}/status`, { status });
    load();
  }

  async function saveNotes(id: string) {
    await api.patch(`/api/enquiries/${id}/notes`, { follow_up_notes: notesDraft[id] || "" });
    load();
  }

  async function convert(enquiry: Enquiry) {
    if (!enquiry.course_id) {
      alert("This enquiry has no course selected — assign a course before converting.");
      return;
    }
    await api.post(`/api/enquiries/${enquiry.id}/convert`, { course_id: enquiry.course_id });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Enquiries</h1>
      <p className="text-sm text-slate mt-1">Track and follow up on admission enquiries</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            placeholder="Search by name, mobile or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-blueprint/20 pl-9 pr-3 py-2.5 text-sm focus:border-signal focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate">Loading…</p>}
        {!loading && enquiries.length === 0 && <p className="text-sm text-slate">No enquiries found.</p>}
        {enquiries.map((e) => (
          <div key={e.id} className="bg-white border border-blueprint/10">
            <div
              className="p-4 flex items-center justify-between flex-wrap gap-3 cursor-pointer"
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            >
              <div>
                <p className="font-medium text-sm text-ink">{e.student_name}</p>
                <p className="font-mono text-xs text-slate mt-1">
                  {e.mobile} {e.email ? `· ${e.email}` : ""} {e.course_title ? `· ${e.course_title}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-xs px-2 py-1 ${STATUS_COLORS[e.status]}`}>
                  {STATUS_LABELS[e.status]}
                </span>
                <span className="font-mono text-xs text-slate">
                  {new Date(e.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            {expanded === e.id && (
              <div className="border-t border-blueprint/10 p-4 space-y-4">
                {e.message && <p className="text-sm text-charcoal">{e.message}</p>}

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(e.id, s)}
                      className={`px-3 py-1.5 text-xs font-medium border ${
                        e.status === s ? "border-blueprint bg-blueprint text-white" : "border-blueprint/20 text-charcoal"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                  <button
                    onClick={() => convert(e)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-signal text-signal"
                  >
                    <ArrowRightCircle size={13} /> Convert to Admission
                  </button>
                </div>

                <div>
                  <textarea
                    placeholder="Follow-up notes…"
                    className="w-full border border-blueprint/20 p-3 text-sm h-20 focus:border-signal focus:outline-none"
                    defaultValue={e.follow_up_notes || ""}
                    onChange={(ev) => setNotesDraft({ ...notesDraft, [e.id]: ev.target.value })}
                  />
                  <button
                    onClick={() => saveNotes(e.id)}
                    className="mt-2 text-xs font-semibold text-blueprint hover:text-signal"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
