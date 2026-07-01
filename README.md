# zkp-frontend

> Next.js 14 frontend for ZKP Private Pay — private institutional payments on Stellar

[![CI](https://github.com/Stellar-ZK-Proof/zkp-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Stellar-ZK-Proof/zkp-frontend/actions/workflows/ci.yml)

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS — dark navy + cyan institutional design
- Freighter wallet integration

## Live Contract (Testnet)

**Contract ID:** `CBV43YWUD4ZJL5WITK7VTU5F6Z25QDQVXDIABQV65JQQNIMNBC6EMIUP`  
[View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBV43YWUD4ZJL5WITK7VTU5F6Z25QDQVXDIABQV65JQQNIMNBC6EMIUP)

## Features
- **Freighter wallet connect** — auto-fills sender address
- **Payment form** with 4-stage progress (proof → submit → settle → done)
- **Proof viewer** — commitment hash, nullifier, audit ref, explorer link
- **Status bar** — live RPC / contract / circuit health
- **How it works** — 4-step ZK flow explainer

## Quickstart

```bash
cp .env.example .env.local
npm install
npm run dev   # → http://localhost:3000
```

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed contract ID |

## Related repos
- [zkp-backend](https://github.com/Stellar-ZK-Proof/zkp-backend)
- [zkp-contract](https://github.com/Stellar-ZK-Proof/zkp-contract)
