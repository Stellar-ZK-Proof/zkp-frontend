"use client";
import { useEffect, useState } from "react";

interface ContractStatus {
  rpc: "checking" | "ok" | "error";
  contract: "checking" | "ok" | "error";
}

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CBV43YWUD4ZJL5WITK7VTU5F6Z25QDQVXDIABQV65JQQNIMNBC6EMIUP";
const RPC_URL = "https://soroban-testnet.stellar.org";

export function StatusBar() {
  const [status, setStatus] = useState<ContractStatus>({ rpc: "checking", contract: "checking" });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" }),
        });
        const data = await res.json();
        const rpcOk = data?.result?.status === "healthy";
        setStatus(s => ({ ...s, rpc: rpcOk ? "ok" : "error" }));
      } catch {
        setStatus(s => ({ ...s, rpc: "error" }));
      }

      // Check contract exists
      try {
        const res = await fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0", id: 2, method: "getLedgerEntries",
            params: {
              keys: [{
                type: "contract",
                contractId: CONTRACT_ID,
              }]
            }
          }),
        });
        const data = await res.json();
        setStatus(s => ({ ...s, contract: data?.result ? "ok" : "error" }));
      } catch {
        setStatus(s => ({ ...s, contract: "error" }));
      }
    })();
  }, []);

  const short = CONTRACT_ID.slice(0, 8) + "…" + CONTRACT_ID.slice(-4);

  return (
    <div className="fixed top-16 inset-x-0 z-40 border-b border-slate-800 bg-navy-900/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-8 flex items-center gap-6 text-xs font-mono">
        <Dot status={status.rpc}   label={`RPC ${status.rpc === "ok" ? "healthy" : status.rpc === "error" ? "unreachable" : "…"}`} />
        <Dot status={status.contract} label={`Contract ${status.contract === "ok" ? short : status.contract === "error" ? "not found" : "…"}`} />
        <Dot status="ok" label="Browser ZK proofs" />
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
          target="_blank" rel="noreferrer"
          className="ml-auto text-slate-600 hover:text-cyan-400 transition-colors flex items-center gap-1"
        >
          testnet
        </a>
      </div>
    </div>
  );
}

function Dot({ status, label }: { status: string; label: string }) {
  const color = status === "ok" ? "bg-emerald-400" : status === "error" ? "bg-red-500" : "bg-amber-400 animate-pulse";
  const text  = status === "ok" ? "text-slate-400" : status === "error" ? "text-red-400" : "text-amber-400";
  return (
    <span className={`flex items-center gap-1.5 ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
