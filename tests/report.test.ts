import { describe, it, expect } from "vitest";
import { buildReport } from "../src/report.js";

describe("report", () => {
  it("produces a verdict", async () => {
    const r = await buildReport({
      cost: { vpsMonthlyUsd: 20, bandwidthCostPerGbUsd: 0.1, monthlyBandwidthGb: 50, pricePer1kRequestsUsd: 0.5 },
      monthlyRequests: 100000,
      benchmarkOpts: { endpoint: "https://example.test", samples: 5, mock: true },
    });
    expect(r.verdict).toBe("likely_profitable");
    expect(r.monthlyProfitUsd).toBeGreaterThan(0);
    expect(r.disclaimer).toContain("Not financial advice");
    expect(r.evidence.length).toBeGreaterThan(0);
  });

  it("insufficient data without benchmark", async () => {
    const r = await buildReport({
      cost: { vpsMonthlyUsd: 20, bandwidthCostPerGbUsd: 0.1, monthlyBandwidthGb: 50, pricePer1kRequestsUsd: 0.5 },
      monthlyRequests: 1000,
    });
    expect(r.verdict).toBe("insufficient_data");
  });
});
