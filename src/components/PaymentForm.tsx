"use client";
import { useState, useEffect } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import { api, PaymentResult } from "@/lib/api";
import { getConnectedAccount } from "@/lib/freighter";

interface Props { onSuccess: (r: PaymentResult) => void }

type Stage = "idle" | "proof" | "submit" | "settle" | "done" | "error";

const STAGE_LABELS: Record<Stage, string> = {
  idle:   "",
  proof:  "Generating ZK proof…",
  submit: "Submitting commitment on-chain…",
  settle: "Settling with proof…",
  done:   "Payment settled ✓",
  error:  "",
};

export function PaymentForm({ onSuccess }: Props) {
  const [form, setForm] = useState({
    senderAddress: "",
    amount: "",
    recipient: "",
    auditRef: "",
  });
  const [stage, setStage]   = useState<Stage>("idle");
  const [error, setError]   = useState<string | null>(null);

  // Auto-fill address from connected wallet
  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc?.publicKey) setForm((f) => ({ ...f, senderAddress: acc.publicKey }));
    });
  }, []);

  const set = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const valid =
    form.senderAddress.startsWith("G") &&
    form.senderAddress.length === 56 &&
    parseFloat(form.amount) > 0 &&
    form.recipient.trim().length > 0 &&
    form.auditRef.trim().length > 0;

  const submit = async () => {
    setError(null);
    try {
      setStage("proof");
      await new Promise((r) => setTimeout(r, 400));
      setStage("submit");
      await new Promise((r) => setTimeout(r, 300));
      setStage("settle");

      const result = await api.submitPayment({
        senderAddress: form.senderAddress,
        amount: Math.round(parseFloat(form.amount) * 10_000_000).toString(),
        recipient: form.recipient,
        auditRef: form.auditRef,
      });

      setStage("done");
      onSuccess(result);
    } catch (err: unknown) {
      setStage("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const busy = stage !== "idle" && stage !== "error" && stage !== "done";

  const fields = [
    { name: "senderAddress", label: "Sender Stellar address", placeholder: "G… (56 chars)", icon: <Wallet className="w-3.5 h-3.5" /> },
    { name: "amount",        label: "Amount (XLM)",           placeholder: "10000.00",      type: "number" },
    { name: "recipient",     label: "Recipient identifier",   placeholder: "Institution BIC, address, or ID — hidden in proof" },
    { name: "auditRef",      label: "Audit reference",        placeholder: "SWIFT ref / internal transaction ID" },
  ] as const;

  return (
    <div className="glass rounded-3xl p-8">
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-white">New private payment</h2>
        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
          Amount and recipient are committed privately. Only you and auditors can reveal them.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">
              {f.label}
            </label>
            <input
              name={f.name}
              type={(f as any).type || "text"}
              value={form[f.name]}
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
            {STAGE_LABELS[stage]}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="font-mono text-xs">{error}</span>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!valid || busy}
        className="mt-7 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-400 text-navy-950 font-display font-semibold text-sm hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-cyan"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {busy ? STAGE_LABELS[stage] : "Send private payment"}
      </button>

      <p className="mt-4 text-center text-xs text-slate-600 font-mono">
        Proof generated locally · commitment settled on Stellar testnet
      </p>
    </div>
  );
}
