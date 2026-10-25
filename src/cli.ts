#!/usr/bin/env node
import { buildReport } from "./report.js";
import type { CostInput } from "./types.js";

async function main() {
  const args = process.argv.slice(2);
  const mock = args.includes("--mock");
  const requests = Number(args.find((a) => a.startsWith("--requests="))?.split("=")[1] ?? "100000");
  const endpoint = args.find((a) => a.startsWith("--endpoint="))?.split("=")[1] ?? "https://example.test";

  const cost: CostInput = {
    vpsMonthlyUsd: 20,
    bandwidthCostPerGbUsd: 0.1,
    monthlyBandwidthGb: 50,
    pricePer1kRequestsUsd: 0.5,
    otherMonthlyUsd: 5,
  };

  const report = await buildReport({
    cost,
    monthlyRequests: requests,
    benchmarkOpts: { endpoint, samples: 5, mock },
  });

  console.log(JSON.stringify(report, (k, v) => (typeof v === "function" ? "[fn]" : v), 2));
  console.log("\nVerdict:", report.verdict);
  console.log("Disclaimer:", report.disclaimer);
}

main().catch((err) => { console.error(err); process.exit(1); });
