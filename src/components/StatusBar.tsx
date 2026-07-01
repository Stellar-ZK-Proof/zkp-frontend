"use client";
import { HealthStatus } from "@/lib/api";

interface Props { health: HealthStatus | null }

export function StatusBar({ health }: Props) {
  if (!health) return null;

  const contractSet = health.contract_id && health.contract_id !== "not_set";
  const rpcOk = health.rpc === "healthy";
  const devMode = health.circuit === "dev_mock";

  return (
    <div className="fixed top-16 inset-x-0 z-40 border-b border-slate-800 bg-navy-900/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-8 flex items-center gap-6 text-xs font-mono">
        <Dot ok={rpcOk} label={`RPC ${rpcOk ? "connected" : "unreachable"}`} />
        <Dot ok={!!contractSet} label={contractSet ? `Contract ${health.contract_id.slice(0, 8)}…` : "No contract set"} />
        <Dot ok={!devMode} warn={devMode} label={devMode ? "Dev mode (mock proofs)" : "Groth16 proofs"} />
        <span className="ml-auto text-slate-600">{health.network}</span>
      </div>
    </div>
  );
}

function Dot({ ok, warn, label }: { ok: boolean; warn?: boolean; label: string }) {
  const color = ok ? "bg-emerald-400" : warn ? "bg-amber-400" : "bg-red-500";
  const text  = ok ? "text-slate-400" : warn ? "text-amber-400" : "text-red-400";
  return (
    <span className={`flex items-center gap-1.5 ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
