"use client";

import { useState } from "react";
import { ShieldCheck, ShieldX, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";

interface VerifyResult {
  valid: boolean;
  message?: string;
  certificate?: {
    certificate_number: string;
    student_name: string;
    course: string;
    issued_date: string;
    institute_name: string;
  };
}

export default function VerifyCertificatePage() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!certId.trim()) return;
    setStatus("loading");
    try {
      const data = await api.post<VerifyResult>("/api/certificates/verify", {
        certificate_number: certId.trim(),
      });
      setResult(data);
    } catch {
      setResult({ valid: false, message: "Certificate not found / Invalid certificate ID." });
    } finally {
      setStatus("done");
    }
  }

  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 py-16">
          <SectionHeading
            eyebrow="Certificate Verification"
            title="Verify a K TEC certificate"
            description="Enter the certificate ID printed on the certificate to confirm its authenticity."
            align="center"
          />
        </div>
      </section>

      <section className="mx-auto max-w-xl px-5 lg:px-8 py-16">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="e.g. KTEC-CERT-XXXXXXX"
            className="flex-1 border border-blueprint/20 bg-white px-4 py-3 text-sm font-mono focus:border-signal focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark disabled:opacity-60 text-white font-display font-semibold px-6 py-3 transition-colors"
          >
            {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Verify
          </button>
        </form>

        {status === "done" && result && (
          <div
            className={`mt-8 border p-6 crop-marks ${
              result.valid ? "border-signal/40 bg-white" : "border-red-300 bg-red-50"
            }`}
          >
            {result.valid && result.certificate ? (
              <>
                <div className="flex items-center gap-2 text-signal">
                  <ShieldCheck size={22} />
                  <span className="font-display font-semibold">Certificate Verified</span>
                </div>
                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="Student Name" value={result.certificate.student_name} />
                  <Row label="Course" value={result.certificate.course} />
                  <Row label="Certificate Number" value={result.certificate.certificate_number} mono />
                  <Row label="Completion Date" value={result.certificate.issued_date} />
                  <Row label="Institute" value={result.certificate.institute_name} />
                </dl>
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <ShieldX size={22} />
                <span className="font-display font-semibold">
                  {result.message || "Certificate not found / Invalid certificate ID."}
                </span>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between border-b border-dashed border-blueprint/15 pb-2">
      <dt className="text-slate">{label}</dt>
      <dd className={`text-ink font-medium ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
