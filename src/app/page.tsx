"use client";
import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { PaymentForm, PaymentResult } from "@/components/PaymentForm";
import { ProofViewer } from "@/components/ProofViewer";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { StatusBar } from "@/components/StatusBar";

export default function Home() {
  const [result, setResult] = useState<PaymentResult | null>(null);
  return (
    <main className="min-h-screen flex flex-col bg-navy-950">
      <Nav />
      <StatusBar />
      <Hero />
      <section id="pay" className="flex-1 py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <PaymentForm onSuccess={setResult} />
          <ProofViewer result={result} />
        </div>
      </section>
      <HowItWorks />
      <Footer />
    </main>
  );
}
