/**
 * Browser-native Stellar Soroban client
 * Signs with Freighter — no secret key ever leaves the wallet
 */

const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CBV43YWUD4ZJL5WITK7VTU5F6Z25QDQVXDIABQV65JQQNIMNBC6EMIUP";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export interface PaymentResult {
  txId: string;
  commitment: string;
  nullifier: string;
  auditRefHash: string;
  status: string;
  explorerUrl: string;
}

function toHex(u: Uint8Array): string {
  return Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function submitPrivatePayment(params: {
  senderAddress: string;
  commitment: Uint8Array;
  nullifier: Uint8Array;
  auditRefHash: Uint8Array;
  proofBytes: Uint8Array;
}): Promise<PaymentResult> {
  const sdk = await import("@stellar/stellar-sdk");
  const {
    Contract,
    TransactionBuilder,
    BASE_FEE,
    xdr,
    Address,
    scValToNative,
  } = sdk;
  const rpc = (sdk as any).rpc as typeof sdk.rpc;

  const server = new rpc.Server(RPC_URL, { allowHttp: false });
  const contract = new Contract(CONTRACT_ID);

  // Helper: simulate → assemble → sign with Freighter → send → poll
  async function runTx(tx: ReturnType<typeof TransactionBuilder.prototype.build>) {
    const sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim)) {
      throw new Error(
        "Simulation failed: " + JSON.stringify((sim as any).error)
      );
    }
    const prep = rpc.assembleTransaction(tx, sim).build();
    const signed = await signWithFreighter(prep.toXDR());

    // Re-parse signed XDR into a transaction
    const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
    const signedTx = TB.fromXDR(signed, NETWORK_PASSPHRASE);
    const res = await server.sendTransaction(signedTx);
    if (res.status === "ERROR") {
      throw new Error("Send error: " + JSON.stringify(res.errorResult));
    }

    for (let i = 0; i < 40; i++) {
      await delay(2000);
      const poll = await server.getTransaction(res.hash);
      if (poll.status === rpc.Api.GetTransactionStatus.SUCCESS) return poll;
      if (poll.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new Error("Transaction failed on-chain");
      }
    }
    throw new Error("Transaction confirmation timeout");
  }

  // --- submit_payment ---
  const acct1 = await server.getAccount(params.senderAddress);
  const submitTx = new TransactionBuilder(acct1, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "submit_payment",
        new Address(params.senderAddress).toScVal(),
        xdr.ScVal.scvBytes(params.commitment as unknown as Buffer),
        xdr.ScVal.scvBytes(params.nullifier as unknown as Buffer),
        xdr.ScVal.scvBytes(params.auditRefHash as unknown as Buffer)
      )
    )
    .setTimeout(60)
    .build();

  const r1 = await runTx(submitTx);
  const successR1 = r1 as any;
  if (!successR1.returnValue) throw new Error("No tx_id from submit_payment");

  const txIdRaw = scValToNative(successR1.returnValue) as Uint8Array;
  const txId = toHex(new Uint8Array(txIdRaw));

  // --- settle_payment ---
  const acct2 = await server.getAccount(params.senderAddress);
  const txIdScVal = xdr.ScVal.scvBytes(txIdRaw as unknown as Buffer);

  const piVec = xdr.ScVal.scvVec([
    xdr.ScVal.scvBytes(params.commitment as unknown as Buffer),
    xdr.ScVal.scvBytes(params.nullifier as unknown as Buffer),
    xdr.ScVal.scvBytes(params.auditRefHash as unknown as Buffer),
  ]);
  const proofMap = xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("proof_bytes"),
      val: xdr.ScVal.scvBytes(params.proofBytes as unknown as Buffer),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("public_inputs"),
      val: piVec,
    }),
  ]);

  const settleTx = new TransactionBuilder(acct2, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("settle_payment", txIdScVal, proofMap))
    .setTimeout(60)
    .build();

  await runTx(settleTx);

  return {
    txId,
    commitment: toHex(params.commitment),
    nullifier: toHex(params.nullifier),
    auditRefHash: toHex(params.auditRefHash),
    status: "settled",
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txId}`,
  };
}

async function signWithFreighter(xdrBase64: string): Promise<string> {
  const freighter = await import("@stellar/freighter-api");
  const result = await (freighter as any).signTransaction(xdrBase64, {
    networkPassphrase: NETWORK_PASSPHRASE,
    network: "TESTNET",
  });
  // Handle both v1 (string) and v2 (object) response shapes
  if (typeof result === "string") return result;
  if (result?.signedTxXdr) return result.signedTxXdr;
  if (result?.error) throw new Error(result.error);
  throw new Error("Freighter returned unexpected format");
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
