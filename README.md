# zkp-frontend

> Next.js 14 frontend for ZKP Private Pay — private institutional payments on Stellar

[![CI](https://github.com/Stellar-ZK-Proof/zkp-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Stellar-ZK-Proof/zkp-frontend/actions/workflows/ci.yml)

## Stack
- Next.js 14 (App Router)
- Tailwind CSS — dark navy + cyan institutional design
- TypeScript
- Freighter wallet integration

## Screens

- **Hero** — stats bar (settlement time, fee, proof size, audit compliance)
- **Payment form** — sender, amount, recipient, audit reference
- **Proof viewer** — commitment hash, tx ID, settlement status with copy-to-clipboard
- **How it works** — 4-step ZK flow explainer

## Quickstart

```bash
cp .env.example .env
npm install
npm run dev   # → http://localhost:3000
```

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:4000) |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` |

## Deploy

```bash
npm run build
# Deploy to Vercel, Netlify, or any Node.js host
```

## Related repos
- [zkp-backend](https://github.com/Stellar-ZK-Proof/zkp-backend)
- [zkp-contract](https://github.com/Stellar-ZK-Proof/zkp-contract)
