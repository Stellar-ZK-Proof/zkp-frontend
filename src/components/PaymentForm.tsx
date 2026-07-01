"use client";
import { useState, useEffect } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import { generateProofBundle } from "@/lib/zkp-browser";
import { submitPrivatePayment } from "@/lib/stellar-browser";
import { connectFreighter, getConnectedAccount } from "@/lib/freighter";

type Stage = "idle" | "wallet" | "proof" | "submit" | "settle" | "done" | "error";

const STAGE_LABEL: Record<Stage, string> = {
  idle:   "",
  wallet: "Connecting wallet…",
  proof:  "Generating ZK proof…",
  submit: "Submitting commitment on-chain…",
  settle: "Settling with proof…",
  done:   "Payment settled ✓",
  error:  "",
};

export interface PaymentResult {
  txId: string;
  commitment: string;
  nullifier: string;
  auditRefHash: string;
  status: string;
  explorerUrl: string;
}

interface Props { onSuccess: (r: PaymentResult) => void }

export function PaymentForm({ onSuccess }: Props) {
  const [form, setForm] = useState({ amount: "", recipient: "", auditRef: "" });
  const [address, setAddress] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConnectedAccount().then(acc => { if (acc?.publicKey) setAddress(acc.publicKey); });
  }, []);

  const set = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const valid = parseFloat(form.amount) > 0 &&
    form.recipient.trim().length > 0 &&
    form.auditRef.trim().length > 0;

  const submit = async () => {
    setError(null);
    try {
      // 1. Ensure wallet connected
      let sender = address;
      if (!sender) {
        setStage("wallet");
        const acc = await connectFreighter();
        sender = acc.publicKey;
        setAddress(sender);
      }

      // 2. Generate ZK proof
      setStage("proof");
      const bundle = await generateProofBundle({
        amount: Math.round(parseFloat(form.amount) * 10_000_000).toString(),
        recipient: form.recipient,
        auditRef: form.auditRef,
      });

      // 3. Submit + settle on-chain
      setStage("submit");
      // Small delay so user sees the stage
      await new Promise(r => setTimeout(r, 300));
      setStage("settle");

      const result = await submitPrivatePayment({
        senderAddress: sender,
        commitment:   bundle.commitment,
        nullifier:    bundle.nullifier,
        auditRefHash: bundle.auditRefHash,
        proofBytes:   bundle.proofBytes,
      });

      setStage("done");
      onSuccess(result);
    } catch (err: unknown) {
      setStage("error");
      const msg = err instanceof Error ? err.message : String(err);
      // Surface friendly messages for common cases
      if (msg.includes("not whitelisted")) {
        setError("Your address isn't whitelisted on this contract yet. For testing, use the deployer address: GA2LCOB7EO77Q52NO4R3TJ2UTAV7NG3P7S26QUV2YSMIE7UHNUWKBE7V");
      } else if (msg.includes("Freighter") || msg.includes("wallet")) {
        setError("Freighter wallet not found. Install it from freighter.app, then refresh.");
      } else {
        setError(msg);
      }
    }
  };

  const busy = !["idle", "error", "done"].includes(stage);

  return (
    <div className="glass rounded-3xl p-8">
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-white">New private payment</h2>
        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
          Proof generated in-browser · signed by Freighter · settled on Stellar testnet
        </p>
      </div>

      {/* Wallet status */}
      <div className="mb-5 flex items-center gap-3">
        {address ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400/5 border border-emerald-400/20 w-full">
            <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono text-xs text-emerald-400 truncate">{address}</span>
          </div>
        ) : (
          <button onClick={async () => {
            const acc = await connectFreighter();
            setAddress(acc.publicKey);
          }} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all text-xs font-mono w-full">
            <Wallet className="w-3.5 h-3.5" />
            Connect Freighter wallet
          </button>
        )}
      </div>

      <div className="space-y-4">
        {[
          { name: "amount",    label: "Amount (XLM)",         placeholder: "10000.00",                      type: "number" },
          { name: "recipient", label: "Recipient identifier", placeholder: "BIC, address, or internal ID — hidden in proof" },
          { name: "auditRef",  label: "Audit reference",      placeholder: "SWIFT ref, internal TX ID" },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">{f.label}</label>
            <input
              name={f.name}
              type={(f as any).type || "text"}
              value={(form as any)[f.name]}
              onChange={set}
              placeholder={f.placeholder}
              disabled={busy}
              className="w-full bg-navy-900 border border-slate-750 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all font-mono disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      {/* Stage indicator */}
      {stage !== "idle" && stage !== "error" && (
        <div className="mt-5 flex items-center gap-2.5">
          {stage === "done"
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            : <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
          <span className={`text-sm font-mono ${stage === "done" ? "text-emerald-400" : "text-cyan-400"}`}>
            {STAGE_LABEL[stage]}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="font-mono text-xs leading-relaxed">{error}</span>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!valid || busy}
        className="mt-7 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-400 text-navy-950 font-display font-semibold text-sm hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-cyan"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {busy ? STAGE_LABEL[stage] : "Send private payment"}
      </button>

      <p className="mt-4 text-center text-xs text-slate-600 font-mono">
        No backend · proof runs in browser · Freighter signs
      </p>
    </div>
  );
}
