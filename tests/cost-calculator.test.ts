import { describe, it, expect } from "vitest";
import { computeCost } from "../src/cost-calculator.js";

describe("cost calculator", () => {
  it("computes total monthly cost", () => {
    const r = computeCost({
      vpsMonthlyUsd: 20,
      bandwidthCostPerGbUsd: 0.1,
      monthlyBandwidthGb: 50,
      pricePer1kRequestsUsd: 0.5,
    });
    expect(r.totalMonthlyCostUsd).toBe(25);
  });

  it("computes break-even requests", () => {
    const r = computeCost({
      vpsMonthlyUsd: 20,
      bandwidthCostPerGbUsd: 0.1,
      monthlyBandwidthGb: 50,
      pricePer1kRequestsUsd: 0.5,
    });
    // price per request = 0.0005; break-even = 25 / 0.0005 = 50000
    expect(r.breakEvenRequests).toBe(50000);
  });

  it("profitAt works", () => {
    const r = computeCost({
      vpsMonthlyUsd: 20,
      bandwidthCostPerGbUsd: 0.1,
      monthlyBandwidthGb: 50,
      pricePer1kRequestsUsd: 0.5,
    });
    expect(r.profitAt(50000)).toBeCloseTo(0, 5);
    expect(r.profitAt(100000)).toBeGreaterThan(0);
  });

  it("null break-even when price is 0", () => {
    const r = computeCost({
      vpsMonthlyUsd: 20,
      bandwidthCostPerGbUsd: 0.1,
      monthlyBandwidthGb: 50,
      pricePer1kRequestsUsd: 0,
    });
    expect(r.breakEvenRequests).toBeNull();
  });

  it("rejects invalid input", () => {
    expect(() => computeCost({ vpsMonthlyUsd: -1 })).toThrow();
  });
});
