/**
 * Browser-native Stellar Soroban client
 * Submits ZK-gated payments directly to testnet from the browser
 */

const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CBV43YWUD4ZJL5WITK7VTU5F6Z25QDQVXDIABQV65JQQNIMNBC6EMIUP";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK = "Test SDF Network ; September 2015";

export interface SubmitResult {
  txId: string;
  commitment: string;
  nullifier: string;
  auditRefHash: string;
  status: string;
  explorerUrl: string;
}

/**
 * Submit a ZK-gated private payment from the browser.
 * Uses Freighter wallet to sign — no secret key exposure.
 */
export async function submitPrivatePayment(params: {
  senderAddress: string;
  commitment: Uint8Array;    // 32 bytes
  nullifier: Uint8Array;     // 32 bytes
  auditRefHash: Uint8Array;  // 32 bytes
  proofBytes: Uint8Array;
}): Promise<SubmitResult> {
  const sdk = await import("@stellar/stellar-sdk");
  const { Contract, TransactionBuilder, Networks, BASE_FEE, xdr, Address } = sdk;

  const { rpc } = sdk as any;
  const server = new rpc.Server(RPC_URL, { allowHttp: false });

  const account = await server.getAccount(params.senderAddress);
  const contract = new Contract(CONTRACT_ID);

  // --- Step 1: submit_payment ---
  const submitTx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK,
  })
    .addOperation(
      contract.call(
        "submit_payment",
        new Address(params.senderAddress).toScVal(),
        xdr.ScVal.scvBytes(Buffer.from(params.commitment)),
        xdr.ScVal.scvBytes(Buffer.from(params.nullifier)),
        xdr.ScVal.scvBytes(Buffer.from(params.auditRefHash))
      )
    )
    .setTimeout(60)
    .build();

  const sim1 = await server.simulateTransaction(submitTx);
  if (!rpc.Api.isSimulationSuccess(sim1)) {
    throw new Error("Simulation failed: " + JSON.stringify((sim1 as any).error));
  }

  const prep1 = rpc.assembleTransaction(submitTx, sim1).build();
  const signed1 = await signWithFreighter(prep1.toXDR());
  const result1 = await sendAndConfirm(server, rpc, signed1);

  if (!result1.returnValue) throw new Error("No tx_id returned from submit_payment");
  const txIdBytes = Buffer.from((result1.returnValue as any).bytes());
  const txId = txIdBytes.toString("hex");

  // --- Step 2: settle_payment with ZK proof ---
  const account2 = await server.getAccount(params.senderAddress);
  const piVec = xdr.ScVal.scvVec([
    xdr.ScVal.scvBytes(Buffer.from(params.commitment)),
    xdr.ScVal.scvBytes(Buffer.from(params.nullifier)),
    xdr.ScVal.scvBytes(Buffer.from(params.auditRefHash)),
  ]);
  const proofMap = xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("proof_bytes"), val: xdr.ScVal.scvBytes(Buffer.from(params.proofBytes)) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("public_inputs"), val: piVec }),
  ]);

  const settleTx = new TransactionBuilder(account2, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK,
  })
    .addOperation(contract.call("settle_payment", xdr.ScVal.scvBytes(txIdBytes), proofMap))
    .setTimeout(60)
    .build();

  const sim2 = await server.simulateTransaction(settleTx);
  if (!rpc.Api.isSimulationSuccess(sim2)) {
    throw new Error("Settle simulation failed: " + JSON.stringify((sim2 as any).error));
  }

  const prep2 = rpc.assembleTransaction(settleTx, sim2).build();
  const signed2 = await signWithFreighter(prep2.toXDR());
  await sendAndConfirm(server, rpc, signed2);

  return {
    txId,
    commitment: Buffer.from(params.commitment).toString("hex"),
    nullifier: Buffer.from(params.nullifier).toString("hex"),
    auditRefHash: Buffer.from(params.auditRefHash).toString("hex"),
    status: "settled",
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txId}`,
  };
}

async function signWithFreighter(xdrBase64: string): Promise<string> {
  const { signTransaction } = await import("@stellar/freighter-api");
  const result = await signTransaction(xdrBase64, {
    networkPassphrase: NETWORK,
    network: "TESTNET",
  });
  if (typeof result === "string") return result;
  if ((result as any).error) throw new Error((result as any).error);
  return (result as any).signedTxXdr || result;
}

async function sendAndConfirm(server: any, rpc: any, signedXdr: string) {
  const { TransactionBuilder } = await import("@stellar/stellar-sdk");
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK);
  const res = await server.sendTransaction(tx);
  if (res.status === "ERROR") throw new Error("Send error: " + JSON.stringify(res.errorResult));

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const poll = await server.getTransaction(res.hash);
    if (poll.status === rpc.Api.GetTransactionStatus.SUCCESS) return poll;
    if (poll.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
  }
  throw new Error("Transaction timeout");
}
