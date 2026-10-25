export interface CostInput {
  /** Monthly VPS/server cost in USD. */
  vpsMonthlyUsd: number;
  /** Cost per GB of bandwidth in USD. */
  bandwidthCostPerGbUsd: number;
  /** Estimated monthly outbound bandwidth in GB. */
  monthlyBandwidthGb: number;
  /** Price charged per 1000 requests (USD). 0 = free tier. */
  pricePer1kRequestsUsd: number;
  /** Other monthly costs (monitoring, backups, etc.) in USD. */
  otherMonthlyUsd?: number;
}

export interface CostResult {
  totalMonthlyCostUsd: number;
  costPerRequestUsd: number;
  breakEvenRequests: number | null; // null if price is 0
  profitAt: (requests: number) => number;
}

export interface BenchmarkSample {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

export interface BenchmarkResult {
  samples: number;
  successes: number;
  failures: number;
  successRate: number;
  minMs: number | null;
  maxMs: number | null;
  avgMs: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  mock: boolean;
}

export interface ProfitabilityReport {
  cost: CostResult;
  benchmark: BenchmarkResult | null;
  monthlyRequests: number;
  monthlyRevenueUsd: number;
  monthlyProfitUsd: number;
  verdict: "likely_profitable" | "break_even" | "likely_loss" | "insufficient_data";
  evidence: string[];
  disclaimer: string;
}
