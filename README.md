# pi-rpc-lab

> Pi RPC profitability lab: cost vs requests, latency/uptime benchmark, break-even.
> **Tool only — no hosting. Testnet-first. Not financial advice. Not affiliated with Pi Network.**

## What it does

- **Cost Calculator** — VPS + bandwidth + other costs → total monthly cost, break-even requests, profit at a given volume.
- **RPC Benchmark** — measure latency/success rate against a configured endpoint (mock supported, labelled).
- **Profitability Report** — combines cost + benchmark + assumed volume → verdict + evidence.

## Quick start

```bash
npm install
npm test
npm run typecheck
npm run build
node dist/cli.js --mock --requests=100000
```

## Principles

- No invented endpoints/methods — endpoint is user-configured and verified.
- Mock responses labelled `mock: true`.
- No financial advice; estimates only.
- No hosting provided.

## License

MIT.
