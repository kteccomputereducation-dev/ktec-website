import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "@/lib/auth-context";

// NOTE ON FONTS
// This build environment cannot reach fonts.googleapis.com, so the type
// system below uses carefully-ordered system-font stacks that approximate
// the intended design (a geometric display face + a humanist body face +
// a monospace utility face for technical/tabular details). In a normal
// deployment (Vercel, etc. — which do have internet access) you can swap
// these for next/font/google, e.g.:
//   import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
// and feed the resulting `variable` class names into the <body> tag below.

export const metadata: Metadata = {
  title: "K TEC Computer Education – Neyveli | Computer & CAD Training Institute",
  description:
    "K TEC Computer Education, Neyveli — ISO certified computer institute offering programming, Tally, CAD/engineering software and professional IT courses with 100% practical training and placement assistance.",
  metadataBase: new URL("https://www.kteccomputereducation.com"),
  openGraph: {
    title: "K TEC Computer Education – Neyveli",
    description: "Professional Computer Education & Career-Oriented Training in Neyveli, Tamil Nadu.",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased font-body bg-paper text-charcoal min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
