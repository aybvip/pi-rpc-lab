import type { BenchmarkSample, BenchmarkResult } from "./types.js";

export interface BenchmarkOptions {
  endpoint: string;
  path?: string;
  samples?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  mock?: boolean;
}

export async function runBenchmark(opts: BenchmarkOptions): Promise<BenchmarkResult> {
  const samples = opts.samples ?? 10;
  const timeoutMs = opts.timeoutMs ?? 5000;
  const path = opts.path ?? "/";

  if (opts.mock) {
    // Deterministic mock: label clearly.
    const mockSamples: BenchmarkSample[] = Array.from({ length: samples }, (_, i) => ({
      ok: true,
      latencyMs: 40 + (i % 5) * 3,
    }));
    return summarize(mockSamples, true);
  }

  const fetchImpl = opts.fetchImpl ?? fetch;
  const collected: BenchmarkSample[] = [];

  for (let i = 0; i < samples; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();
    try {
      const res = await fetchImpl(`${opts.endpoint.replace(/\/+$/, "")}${path.startsWith("/") ? path : "/" + path}`, {
        signal: controller.signal,
      });
      const latencyMs = Date.now() - start;
      collected.push({ ok: res.ok, latencyMs, error: res.ok ? undefined : `HTTP ${res.status}` });
    } catch (err) {
      const latencyMs = Date.now() - start;
      const msg = err instanceof Error ? err.message : String(err);
      collected.push({ ok: false, latencyMs, error: /abort/i.test(msg) ? `timeout ${timeoutMs}ms` : msg });
    } finally {
      clearTimeout(timer);
    }
  }

  return summarize(collected, false);
}

function summarize(samples: BenchmarkSample[], mock: boolean): BenchmarkResult {
  const latencies = samples.filter((s) => s.ok).map((s) => s.latencyMs).sort((a, b) => a - b);
  const successes = samples.filter((s) => s.ok).length;
  const failures = samples.length - successes;
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = latencies.length ? sum / latencies.length : null;
  const p50 = percentile(latencies, 0.5);
  const p95 = percentile(latencies, 0.95);
  const min = latencies.length ? latencies[0] : null;
  const max = latencies.length ? latencies[latencies.length - 1] : null;

  return {
    samples: samples.length,
    successes,
    failures,
    successRate: samples.length ? successes / samples.length : 0,
    minMs: min,
    maxMs: max,
    avgMs: avg !== null ? Math.round(avg) : null,
    p50Ms: p50,
    p95Ms: p95,
    mock,
  };
}

function percentile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null;
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}
