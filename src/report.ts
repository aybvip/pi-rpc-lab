import type { CostInput } from "./types.js";
import { computeCost } from "./cost-calculator.js";
import { runBenchmark, type BenchmarkOptions } from "./benchmark.js";
import type { ProfitabilityReport, BenchmarkResult, CostResult } from "./types.js";

export interface ReportInput {
  cost: CostInput;
  monthlyRequests: number;
  benchmarkOpts?: BenchmarkOptions;
}

export async function buildReport(input: ReportInput): Promise<ProfitabilityReport> {
  const cost: CostResult = computeCost(input.cost);
  const benchmark: BenchmarkResult | null = input.benchmarkOpts
    ? await runBenchmark(input.benchmarkOpts)
    : null;

  const monthlyRevenueUsd = (input.monthlyRequests * input.cost.pricePer1kRequestsUsd) / 1000;
  const monthlyProfitUsd = monthlyRevenueUsd - cost.totalMonthlyCostUsd;

  const evidence: string[] = [];
  evidence.push(`Total monthly cost: $${cost.totalMonthlyCostUsd}`);
  evidence.push(`Break-even requests: ${cost.breakEvenRequests ?? "n/a (price=0)"}`);
  evidence.push(`Monthly requests assumed: ${input.monthlyRequests}`);
  evidence.push(`Monthly revenue: $${round2(monthlyRevenueUsd)}`);
  evidence.push(`Monthly profit: $${round2(monthlyProfitUsd)}`);
  if (benchmark) {
    evidence.push(`Benchmark success rate: ${(benchmark.successRate * 100).toFixed(1)}%`);
    evidence.push(`Benchmark p50 latency: ${benchmark.p50Ms ?? "n/a"} ms`);
    evidence.push(`Benchmark p95 latency: ${benchmark.p95Ms ?? "n/a"} ms`);
    if (benchmark.mock) evidence.push("Benchmark data is MOCK (labelled).");
  }

  let verdict: ProfitabilityReport["verdict"];
  if (!benchmark || benchmark.samples === 0) {
    verdict = "insufficient_data";
  } else if (monthlyProfitUsd > 0 && benchmark.successRate >= 0.95) {
    verdict = "likely_profitable";
  } else if (Math.abs(monthlyProfitUsd) < 0.01) {
    verdict = "break_even";
  } else {
    verdict = "likely_loss";
  }

  return {
    cost,
    benchmark,
    monthlyRequests: input.monthlyRequests,
    monthlyRevenueUsd: round2(monthlyRevenueUsd),
    monthlyProfitUsd: round2(monthlyProfitUsd),
    verdict,
    evidence,
    disclaimer:
      "Tool only. Estimates based on provided inputs and measured samples. Not financial advice. No hosting provided. Testnet-first.",
  };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
