"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Globe, MapPin, Phone, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { SiteSettings } from "@/lib/types";

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    api
      .get<{ settings: SiteSettings }>("/api/settings")
      .then((d) => setSettings(d.settings))
      .catch(() => {});
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white mt-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <span className="font-display font-semibold text-lg">K TEC COMPUTER EDUCATION</span>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            Professional computer education and career-oriented technical training in Neyveli —
            practical, industry-focused, and student-first.
          </p>
          <div className="flex gap-3 mt-5">
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/60 hover:text-signal">
                <Globe size={18} />
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-signal">
                <Globe size={18} />
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/60 hover:text-signal">
                <Globe size={18} />
              </a>
            )}
          </div>
        </div>

        <FooterCol
          title="Quick Links"
          links={[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            { href: "/courses", label: "Courses" },
            { href: "/admissions", label: "Admissions" },
            { href: "/gallery", label: "Gallery" },
            { href: "/contact", label: "Contact" },
          ]}
        />

        <FooterCol
          title="Courses"
          links={[
            { href: "/courses?category=computer-fundamentals", label: "Computer Courses" },
            { href: "/courses?category=programming", label: "Programming" },
            { href: "/courses?category=cad-engineering", label: "CAD / Engineering" },
            { href: "/courses?category=accounting", label: "Tally" },
            { href: "/courses?category=professional-it", label: "SAP" },
          ]}
        />

        <div>
          <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-white/70 mb-4">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-signal" />
              <span>{settings.address_line || "Opposite to NLC Arch Gate, Neyveli, Tamil Nadu, India"}</span>
            </li>
            {settings.phone && (
              <li className="flex gap-2">
                <Phone size={16} className="mt-0.5 shrink-0 text-signal" />
                <a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-2">
                <Mail size={16} className="mt-0.5 shrink-0 text-signal" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
              </li>
            )}
          </ul>
          <div className="mt-5 flex flex-col gap-2 text-sm">
            <Link href="/login" className="text-white/70 hover:text-white">Student Login</Link>
            <Link href="/verify-certificate" className="text-white/70 hover:text-white">Certificate Verification</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="text-center text-xs text-white/50 font-mono">
          © {year} K TEC COMPUTER EDUCATION. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-white/70 mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-white/70">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
