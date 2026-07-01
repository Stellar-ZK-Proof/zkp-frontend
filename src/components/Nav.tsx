"use client";
import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { connectFreighter, getConnectedAccount } from "@/lib/freighter";

export function Nav() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    getConnectedAccount().then((acc) => acc && setAddress(acc.publicKey));
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const acc = await connectFreighter();
      setAddress(acc.publicKey);
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  };

  const short = (addr: string) => addr.slice(0, 4) + "…" + addr.slice(-4);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-cyan-400/10 bg-navy-900/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
          <span className="font-display font-semibold tracking-tight text-white">
            ZKP<span className="text-cyan-400">PrivatePay</span>
          </span>
        </div>
        <div className="flex items-center gap-5 text-sm text-slate-400">
          <a href="#pay"  className="hover:text-cyan-400 transition-colors hidden sm:block">Send</a>
          <a href="#how"  className="hover:text-cyan-400 transition-colors hidden sm:block">How it works</a>
          <a href="https://github.com/Stellar-ZK-Proof" target="_blank" rel="noreferrer"
             className="hover:text-cyan-400 transition-colors hidden sm:block">GitHub</a>
          {address ? (
            <span className="px-3 py-1.5 rounded-full border border-cyan-400/30 text-cyan-400 text-xs font-mono">
              {short(address)}
            </span>
          ) : (
            <button onClick={connect} disabled={connecting}
              className="px-4 py-1.5 rounded-full border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-all text-xs font-medium disabled:opacity-50">
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
