const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface PaymentResult {
  txId: string;
  commitment: string;
  nullifier: string;
  auditRefHash: string;
  status: string;
  mode: string;
  explorerUrl: string;
}

export interface ProofBundle {
  commitment: string;
  nullifier: string;
  auditRefHash: string;
  proofBytes: string;
  publicInputs: string[];
  salt: string;
  mode: string;
}

export interface HealthStatus {
  status: string;
  contract_id: string;
  network: string;
  rpc: string;
  circuit: string;
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json as T;
}

export const api = {
  health: () => request<HealthStatus>("/api/health"),

  submitPayment: (body: {
    senderAddress: string;
    amount: string;
    recipient: string;
    auditRef: string;
  }) => request<PaymentResult>("/api/payments/submit", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  generateProof: (body: {
    amount: string;
    recipient: string;
    auditRef: string;
  }) => request<ProofBundle>("/api/proofs/generate", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  verifyProof: (proofBytes: string, publicInputs: string[]) =>
    request<{ valid: boolean; mode: string }>("/api/proofs/verify", {
      method: "POST",
      body: JSON.stringify({ proofBytes, publicInputs }),
    }),

  getTransaction: (txId: string) =>
    request<Record<string, unknown>>(`/api/payments/${txId}`),
};
