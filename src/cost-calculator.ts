import { z } from "zod";
import type { CostInput, CostResult } from "./types.js";

export const CostInputSchema = z.object({
  vpsMonthlyUsd: z.number().nonnegative(),
  bandwidthCostPerGbUsd: z.number().nonnegative(),
  monthlyBandwidthGb: z.number().nonnegative(),
  pricePer1kRequestsUsd: z.number().nonnegative(),
  otherMonthlyUsd: z.number().nonnegative().optional(),
});

export function computeCost(raw: unknown): CostResult {
  const input = CostInputSchema.parse(raw) as CostInput;
  const other = input.otherMonthlyUsd ?? 0;
  const bandwidthCost = input.bandwidthCostPerGbUsd * input.monthlyBandwidthGb;
  const totalMonthlyCostUsd = input.vpsMonthlyUsd + bandwidthCost + other;

  const pricePerRequest = input.pricePer1kRequestsUsd / 1000;
  const costPerRequestUsd = pricePerRequest > 0 ? pricePerRequest : totalMonthlyCostUsd;

  const breakEvenRequests =
    pricePerRequest > 0 ? Math.ceil(totalMonthlyCostUsd / pricePerRequest) : null;

  const profitAt = (requests: number): number => {
    const revenue = requests * pricePerRequest;
    return revenue - totalMonthlyCostUsd;
  };

  return {
    totalMonthlyCostUsd: round2(totalMonthlyCostUsd),
    costPerRequestUsd: round6(costPerRequestUsd),
    breakEvenRequests,
    profitAt,
  };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function round6(n: number) { return Math.round(n * 1e6) / 1e6; }
