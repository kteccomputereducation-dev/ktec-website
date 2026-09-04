"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api, fileUrl } from "@/lib/api";
import { GalleryImage } from "@/lib/types";
import SectionHeading from "@/components/SectionHeading";

const CATEGORY_LABELS: Record<string, string> = {
  classroom: "Classroom",
  lab: "Computer Lab",
  events: "Events",
  workshops: "Workshops",
  activities: "Student Activities",
  certificates: "Certificates",
  competitions: "Competitions",
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ images: GalleryImage[] }>("/api/gallery")
      .then((d) => setImages(d.images))
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === "all" ? images : images.filter((i) => i.category === active);
  const categories = Array.from(new Set(images.map((i) => i.category)));

  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
          <SectionHeading eyebrow="Gallery" title="Life at K TEC Computer Education" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <FilterButton active={active === "all"} onClick={() => setActive("all")} label="All" />
            {categories.map((cat) => (
              <FilterButton
                key={cat}
                active={active === cat}
                onClick={() => setActive(cat)}
                label={CATEGORY_LABELS[cat] || cat}
              />
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate">Loading gallery…</p>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((img) => (
              <div key={img.id} className="relative aspect-square bg-paper-dim border border-blueprint/10 overflow-hidden">
                <Image
                  src={fileUrl(img.image_url) || ""}
                  alt={img.caption || "K TEC gallery photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate">
            Gallery photos will appear here once uploaded from the Admin Panel.
          </p>
        )}
      </section>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border transition-colors ${
        active ? "bg-blueprint text-white border-blueprint" : "border-blueprint/20 text-charcoal hover:border-blueprint"
      }`}
    >
      {label}
    </button>
  );
}
