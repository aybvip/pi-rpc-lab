import { describe, it, expect } from "vitest";
import { runBenchmark } from "../src/benchmark.js";

describe("benchmark", () => {
  it("mock returns success rate 1", async () => {
    const r = await runBenchmark({ endpoint: "https://example.test", samples: 5, mock: true });
    expect(r.mock).toBe(true);
    expect(r.successRate).toBe(1);
    expect(r.samples).toBe(5);
    expect(r.p50Ms).not.toBeNull();
  });

  it("handles fetch failure", async () => {
    const fetchImpl = async () => { throw new Error("boom"); };
    const r = await runBenchmark({ endpoint: "https://example.test", samples: 3, fetchImpl: fetchImpl as any });
    expect(r.successRate).toBe(0);
    expect(r.failures).toBe(3);
  });
});
