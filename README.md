# Fluton Privacy Checker

A single-page, read-only Ethereum wallet privacy checker built with Next.js 14, TypeScript, and Tailwind CSS. The browser requests public transaction data from Etherscan and calculates an educational privacy estimate; no wallet connection or backend is used.

## Run locally

1. Install Node.js 18.17+ (Node 20+ recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a free API key at [Etherscan](https://etherscan.io/myapikey), then copy `.env.example` to `.env.local` and set:
   ```env
   NEXT_PUBLIC_ETHERSCAN_API_KEY=your_key
   ```
   `NEXT_PUBLIC_` variables are bundled into the browser. This is a public, rate-limited API key—not a secret. Do not put passwords or private credentials here.
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm test
npm run typecheck
npm run build
```

## How the estimate works

The score begins at 100 and subtracts 0.5 per normal transaction, 1 per unique contract/token contract, 2 per approval, 3 per detected swap, 3 per likely bridge interaction, and 5 per native ETH transfer valued above $10,000. Scores are clamped at zero and labeled GHOST (90–100), CAUTIOUS (70–89), EXPOSED (50–69), VULNERABLE (30–49), or FULLY TRANSPARENT (0–29).

Swap, approval, and bridge categorization uses transaction calldata/function-name heuristics; bridge detections may be incomplete or incorrect. The large-transfer calculation uses a current ETH/USD spot quote and only sees native ETH values. If that quote is unavailable, the large-transfer deduction is skipped. Etherscan results are limited to the first 10,000 records per endpoint. This score is not an audit or a measure of cryptographic privacy.

## Data and privacy

The app reads public Ethereum transaction and token-transfer data from Etherscan, plus an ETH/USD quote from CoinGecko. It does not connect to a wallet, send transactions, persist addresses, or run a database. Requests go directly from the user's browser to those providers. Provider rate limits, API-key restrictions, network policies, and CORS behavior apply.
