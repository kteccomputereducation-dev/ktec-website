"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { Offer } from "@/lib/types";
import SectionHeading from "@/components/SectionHeading";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ offers: Offer[] }>("/api/offers")
      .then((d) => setOffers(d.offers))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
          <SectionHeading eyebrow="Offers" title="Current offers &amp; discounts" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
        {loading ? (
          <p className="text-sm text-slate">Loading offers…</p>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((o) => (
              <div key={o.id} className="crop-marks bg-white border border-blueprint/10 overflow-hidden">
                {o.banner_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fileUrl(o.banner_image_url) || ""} alt={o.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-draft-dark">
                    <Tag size={13} /> {o.discount_text || "Limited Time"}
                  </span>
                  <h3 className="mt-2 font-display font-semibold text-ink">{o.title}</h3>
                  <p className="mt-2 text-sm text-slate leading-relaxed">{o.description}</p>
                  {o.valid_until && (
                    <p className="mt-3 font-mono text-xs text-slate">Valid until {o.valid_until}</p>
                  )}
                  <Link
                    href="/admissions"
                    className="mt-4 inline-block text-sm font-semibold text-blueprint hover:text-signal"
                  >
                    Enquire Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate">No active offers right now — check back soon.</p>
        )}
      </section>
    </div>
  );
}
