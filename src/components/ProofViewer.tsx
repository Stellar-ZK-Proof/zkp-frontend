"use client";
import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Shield, Clock } from "lucide-react";
import { PaymentResult } from "@/lib/api";

interface Props { result: PaymentResult | null }

function truncate(s: string, n = 14) {
  return s.length > n * 2 ? `${s.slice(0, n)}…${s.slice(-n)}` : s;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-navy-900 rounded-xl p-4">
      <div className="text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm text-cyan-400 break-all leading-relaxed">
          {truncate(value, 16)}
        </span>
        <button onClick={copy} className="shrink-0 text-slate-600 hover:text-cyan-400 transition-colors" title="Copy">
          {copied
            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function ProofViewer({ result }: Props) {
  if (!result) {
    return (
      <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center min-h-96 text-center">
        <div className="w-20 h-20 rounded-2xl border border-slate-800 flex items-center justify-center mb-5">
          <Shield className="w-8 h-8 text-slate-700" strokeWidth={1} />
        </div>
        <h3 className="font-display text-lg font-medium text-slate-400 mb-2">Awaiting payment</h3>
        <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
          Submit a payment to see the ZK commitment and on-chain settlement receipt here.
        </p>
        <div className="mt-8 flex flex-col gap-2 text-xs text-slate-700 font-mono text-left w-full max-w-xs">
          {["1. Generate Groth16 proof locally", "2. Submit commitment on-chain", "3. Settle with proof verification"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-slate-800 flex items-center justify-center text-[10px]">{i+1}</span>
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Settlement receipt</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {result.mode === "dev_mock" ? "Dev mode · mock proof" : "Groth16 proof · on-chain"}
          </p>
        </div>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs capitalize font-mono">
          {result.status}
        </span>
      </div>

      <div className="space-y-3">
        <CopyRow label="TX ID"       value={result.txId} />
        <CopyRow label="Commitment"  value={result.commitment} />
        <CopyRow label="Nullifier"   value={result.nullifier} />
        <CopyRow label="Audit ref ⊕" value={result.auditRefHash} />
      </div>

      {/* Privacy notice */}
      <div className="mt-5 rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-xs text-slate-400 leading-relaxed">
        <span className="text-cyan-400 font-medium">ZK proof verified on Stellar. </span>
        Amount and recipient are hidden in the commitment hash. Only the audit key holder can reveal them. The network confirmed settlement without seeing sensitive data.
      </div>

      {/* Explorer link */}
      <a href={result.explorerUrl} target="_blank" rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors font-mono">
        <ExternalLink className="w-3 h-3" />
        View on Stellar Expert
      </a>
    </div>
  );
}
