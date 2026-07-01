/**
 * Browser-native ZK proof generation using Web Crypto API
 * Commitment scheme: SHA-256 based (Groth16 in production via snarkjs WASM)
 */

export interface ProofBundle {
  commitment: Uint8Array;
  nullifier: Uint8Array;
  auditRefHash: Uint8Array;
  proofBytes: Uint8Array;
  salt: string;
}

async function sha256(...parts: (string | Uint8Array)[]): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const chunks = parts.map((p) => (typeof p === "string" ? enc.encode(p) : p));
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
}

function randomHex(n: number): string {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function toHexStr(u: Uint8Array): string {
  return Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateProofBundle(params: {
  amount: string;
  recipient: string;
  auditRef: string;
}): Promise<ProofBundle> {
  const salt = randomHex(32);

  // commitment = SHA-256(amount:recipient:salt)
  const commitment = await sha256(`${params.amount}:${params.recipient}:${salt}`);

  // nullifier = SHA-256(nullifier:salt:recipient) — spent once, prevents replay
  const nullifier = await sha256(`nullifier:${salt}:${params.recipient}`);

  // audit ref hash — reveals only to auditor
  const auditRefHash = await sha256(params.auditRef);

  // Proof bytes (mock for demo — in production: snarkjs.groth16.fullProve in WASM)
  // 128 bytes derived from commitment+nullifier so it's deterministic per payment
  const proofBase = await sha256(commitment, nullifier);
  const proofBytes = new Uint8Array([
    ...proofBase, ...proofBase, ...proofBase, ...proofBase,
  ]);

  return { commitment, nullifier, auditRefHash, proofBytes, salt };
}
