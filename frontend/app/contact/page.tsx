"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { SiteSettings } from "@/lib/types";
import SectionHeading from "@/components/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    api
      .get<{ settings: SiteSettings }>("/api/settings")
      .then((d) => setSettings(d.settings))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-16">
          <SectionHeading eyebrow="Contact" title="Get in touch with K TEC Computer Education" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <InfoRow icon={MapPin} label="Address">
            {settings.address_line || "Opposite to NLC Arch Gate, Neyveli, Tamil Nadu, India"}
          </InfoRow>
          {settings.phone && (
            <InfoRow icon={Phone} label="Phone">
              <a href={`tel:${settings.phone}`} className="hover:text-signal">{settings.phone}</a>
            </InfoRow>
          )}
          {settings.email && (
            <InfoRow icon={Mail} label="Email">
              <a href={`mailto:${settings.email}`} className="hover:text-signal">{settings.email}</a>
            </InfoRow>
          )}
          <InfoRow icon={Clock} label="Working Hours">
            {settings.working_hours || "Mon - Sat: 9:00 AM - 7:00 PM"}
          </InfoRow>

          {settings.google_maps_link ? (
            <div className="border border-blueprint/10 overflow-hidden aspect-video">
              <iframe
                src={settings.google_maps_link}
                width="100%"
                height="100%"
                loading="lazy"
                title="K TEC Computer Education location"
              />
            </div>
          ) : (
            <div className="border border-dashed border-blueprint/20 p-6 text-sm text-slate">
              Google Maps embed will appear here once configured in Admin &gt; Settings.
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <EnquiryForm />
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-blueprint/20 text-blueprint">
        <Icon size={18} />
      </span>
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-slate">{label}</p>
        <p className="mt-1 text-sm text-charcoal">{children}</p>
      </div>
    </div>
  );
}
