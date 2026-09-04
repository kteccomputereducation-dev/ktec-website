"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { SiteSettings } from "@/lib/types";

const FIELDS: { key: keyof SiteSettings; label: string; hint?: string }[] = [
  { key: "institute_name", label: "Institute Name" },
  { key: "tagline", label: "Tagline" },
  { key: "address_line", label: "Address" },
  { key: "phone", label: "Phone Number" },
  { key: "whatsapp_number", label: "WhatsApp Number", hint: "Digits only with country code, e.g. 919999999999 — no + or spaces" },
  { key: "email", label: "Email" },
  { key: "google_maps_link", label: "Google Maps Embed URL" },
  { key: "working_hours", label: "Working Hours" },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "youtube_url", label: "YouTube URL" },
  { key: "google_business_url", label: "Google Business Profile URL" },
  { key: "website_title", label: "Website Title (SEO)" },
  { key: "seo_description", label: "SEO Meta Description" },
  { key: "founder_name", label: "Founder Name" },
  { key: "founder_title", label: "Founder Title" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<{ settings: SiteSettings }>("/api/settings")
      .then((d) => setSettings(d.settings))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.put("/api/settings", settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sm text-slate">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
      <p className="text-sm text-slate mt-1">
        These values automatically reflect across the header, footer, contact page and WhatsApp button.
      </p>

      <form onSubmit={handleSave} className="mt-6 bg-white border border-blueprint/10 p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FIELDS.map(({ key, label, hint }) => (
          <label key={key} className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-slate">{label}</span>
            <input
              value={settings[key] || ""}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              className="mt-1 w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none"
            />
            {hint && <span className="mt-1 block text-xs text-slate">{hint}</span>}
          </label>
        ))}

        <div className="sm:col-span-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-6 py-2.5"
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Save Settings
          </button>
          {saved && <span className="ml-3 text-sm text-signal">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
