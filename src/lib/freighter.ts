/**
 * Freighter wallet integration — wrapped for @stellar/freighter-api v2.x
 */

export interface FreighterAccount {
  publicKey: string;
  network: string;
}

export async function isFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { isConnected } = await import("@stellar/freighter-api");
    const connected = await isConnected();
    // freighter-api 2.x returns boolean directly
    return typeof connected === "boolean" ? connected : !!(connected as any)?.isConnected;
  } catch {
    return false;
  }
}

export async function connectFreighter(): Promise<FreighterAccount> {
  const { requestAccess, getPublicKey, getNetwork } = await import("@stellar/freighter-api");

  // requestAccess returns void or throws in v2
  try { await requestAccess(); } catch {}

  const [pubkey, network] = await Promise.all([getPublicKey(), getNetwork()]);
  if (!pubkey) throw new Error("Freighter did not return a public key. Make sure it is unlocked.");

  return {
    publicKey: pubkey,
    network:   typeof network === "string" ? network : (network as any)?.network || "TESTNET",
  };
}

export async function getConnectedAccount(): Promise<FreighterAccount | null> {
  try {
    const installed = await isFreighterInstalled();
    if (!installed) return null;
    const { getPublicKey, getNetwork, isAllowed } = await import("@stellar/freighter-api");
    const allowed = await isAllowed();
    if (!allowed) return null;
    const [pubkey, network] = await Promise.all([getPublicKey(), getNetwork()]);
    if (!pubkey) return null;
    return {
      publicKey: pubkey,
      network:   typeof network === "string" ? network : (network as any)?.network || "TESTNET",
    };
  } catch {
    return null;
  }
}
