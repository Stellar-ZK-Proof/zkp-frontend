# zkp-frontend

> Next.js 14 frontend for ZKP Private Pay — private institutional payments on Stellar

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- Freighter wallet integration

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

## Related repos
- [zkp-backend](https://github.com/Stellar-ZK-Proof/zkp-backend)
- [zkp-contract](https://github.com/Stellar-ZK-Proof/zkp-contract)
