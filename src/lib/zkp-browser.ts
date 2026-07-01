/**
 * Browser-native ZK proof generation
 * Uses SHA-256 (Web Crypto API) for commitment derivation
 * In production: snarkjs WASM runs entirely in-browser
 */

export interface ProofBundle {
  commitment: Uint8Array;
  nullifier: Uint8Array;
  auditRefHash: Uint8Array;
  proofBytes: Uint8Array;
  salt: string;
}

async function sha256(...inputs: (string | Uint8Array)[]): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = inputs.map(i =>
    typeof i === "string" ? encoder.encode(i) : i
  );
  const combined = new Uint8Array(parts.reduce((sum, a) => sum + a.length, 0));
  let offset = 0;
  for (const part of parts) { combined.set(part, offset); offset += part.length; }
  const hash = await crypto.subtle.digest("SHA-256", combined);
  return new Uint8Array(hash);
}

function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
}

function toHex(u: Uint8Array): string {
  return Array.from(u).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function generateProofBundle(params: {
  amount: string;
  recipient: string;
  auditRef: string;
}): Promise<ProofBundle> {
  const salt = toHex(randomBytes(32));
  // recipient encoded for use in proof derivation

  // Commitment = SHA-256(amount || ":" || recipient || ":" || salt)
  const commitment = await sha256(
    `${params.amount}:${params.recipient}:${salt}`
  );

  // Nullifier = SHA-256("nullifier:" || salt || ":" || recipient)
  const nullifier = await sha256(
    `nullifier:${salt}:${params.recipient}`
  );

  // Audit ref hash = SHA-256(auditRef)
  const auditRefHash = await sha256(params.auditRef);

  // Mock proof (deterministic for demo — real: snarkjs.groth16.fullProve in browser)
  const proofInput = new Uint8Array([...commitment, ...nullifier]);
  const proofBase = await sha256(proofInput);
  const proofBytes = new Uint8Array([
    ...proofBase, ...proofBase, ...proofBase, ...proofBase
  ]); // 128 bytes

  return { commitment, nullifier, auditRefHash, proofBytes, salt };
}

export function toHexStr(u: Uint8Array): string {
  return Array.from(u).map(b => b.toString(16).padStart(2, "0")).join("");
}
