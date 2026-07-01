"use client";

const stats = [
  { label: "Settlement", value: "~5s" },
  { label: "Tx fee",     value: "<$0.01" },
  { label: "Proof size", value: "128B" },
  { label: "Audit",      value: "ZK ✓" },
];

export function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-24">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-cyan-500/4 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,212,232,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,212,232,1) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/20 text-cyan-400 text-xs font-mono mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-slow" />
          Stellar · Soroban · Groth16 ZK
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight mb-6 animate-slide-up">
          <span className="text-gradient">Private. Compliant.</span>
          <br />
          <span className="text-white">Institutional payments.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in">
          Send cross-border payments where amount and recipient stay hidden on‑chain
          — yet every settlement remains audit-compliant via zero-knowledge proofs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
          <a href="#pay"
            className="px-8 py-3.5 rounded-full bg-cyan-400 text-navy-950 font-display font-semibold hover:bg-cyan-300 transition-all glow-cyan">
            Send a Payment
          </a>
          <a href="https://github.com/Stellar-ZK-Proof/zkp-contract" target="_blank" rel="noreferrer"
            className="px-8 py-3.5 rounded-full border border-slate-700 text-slate-300 hover:border-cyan-400/50 hover:text-white transition-all font-display">
            View Contract
          </a>
        </div>

        <div className="glass rounded-2xl px-8 py-5 inline-grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-mono text-2xl font-medium text-cyan-400">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
