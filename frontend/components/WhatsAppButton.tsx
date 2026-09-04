"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { SiteSettings } from "@/lib/types";

export default function WhatsAppButton() {
  const [number, setNumber] = useState<string>("");

  useEffect(() => {
    api
      .get<{ settings: SiteSettings }>("/api/settings")
      .then((d) => setNumber(d.settings.whatsapp_number || ""))
      .catch(() => {});
  }, []);

  if (!number) return null; // hidden until admin configures a real number in Settings

  const message = encodeURIComponent("Hi, I'd like to know more about courses at K TEC Computer Education.");

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  );
}
