import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "ZKP Private Pay — Stellar",
  description: "Zero-knowledge proof private institutional payments on Stellar Soroban",
  openGraph: {
    title: "ZKP Private Pay",
    description: "Private, audit-compliant institutional payments on Stellar",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
