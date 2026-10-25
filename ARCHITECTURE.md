# Architecture

- `src/cost-calculator.ts` — pure cost math (zod-validated input).
- `src/benchmark.ts` — latency/success measurement with mock support.
- `src/report.ts` — combines cost + benchmark + volume → verdict + evidence.
- `src/cli.ts` — CLI entry point.
- `src/types.ts` — shared types.

No network calls in tests except via injected fetch. Mocks labelled.
