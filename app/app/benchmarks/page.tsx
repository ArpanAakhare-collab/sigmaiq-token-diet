"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart2, Play, Loader2, AlertCircle, ArrowRight, Layers } from "lucide-react";

export default function BenchmarksPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("demo-rag-dataset");
  const [mode, setMode] = useState<string>("Token-Diet");
  const [ablationVariant, setAblationVariant] = useState<string>("");
  const [qualityFloor, setQualityFloor] = useState("0.90");

  const [starting, setStarting] = useState(false);
  const [activeRun, setActiveRun] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => r.json())
      .then((data) => setDatasets(data.datasets || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeRun || activeRun.status === "COMPLETED" || activeRun.status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/runs/${activeRun.id}`);
        const data = await res.json();
        if (data.run) setActiveRun(data.run);
      } catch (e) {
        console.error("Poll run error:", e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeRun]);

  const handleStartBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    setError(null);
    setActiveRun(null);

    try {
      const res = await fetch("/api/benchmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: selectedDataset,
          mode,
          ablationVariant: ablationVariant || undefined,
          qualityFloor: parseFloat(qualityFloor),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start benchmark");
      setActiveRun(data.run);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E2E8F0] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Benchmarks & Ablation Suite</h1>
        <p className="text-xs text-[#64748B] mt-1">
          Asynchronous benchmark evaluator comparing Standard RAG, Compression Baselines, and Token-Diet Ablation Studies.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleStartBenchmark} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#2563EB]" /> Benchmark Job Configurator
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Target RAG Dataset</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
              >
                <option value="demo-rag-dataset">Standard RAG Benchmark Suite (Built-in)</option>
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.itemCount || d.items?.length || 0} items)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Execution Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Token-Diet">Token-Diet (Full Optimizer)</option>
                <option value="Standard RAG">Standard RAG (No Compression)</option>
                <option value="Existing Compression Baseline">Existing Compression Baseline</option>
              </select>
            </div>

            {mode === "Token-Diet" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Ablation Variant (Optional)</label>
                <select
                  value={ablationVariant}
                  onChange={(e) => setAblationVariant(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">Full Token-Diet (All Modules Active)</option>
                  <option value="Without Query-Aware Budget">Without Query-Aware Budget</option>
                  <option value="Without Redundancy Removal">Without Redundancy Removal</option>
                  <option value="Without Quality Guard">Without Quality Guard</option>
                  <option value="Without Automatic Relaxation">Without Automatic Relaxation</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Quality Floor</label>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={qualityFloor}
                onChange={(e) => setQualityFloor(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {error && (
              <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={starting}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Queueing Job...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Benchmark</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {!activeRun && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-3 shadow-sm">
              <BarChart2 className="w-10 h-10 text-[#64748B] mx-auto" />
              <h3 className="text-base font-bold text-[#0F172A]">No Active Benchmark Running</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Configure dataset, mode, and ablation variant, then click "Run Benchmark" to trigger asynchronous execution.
              </p>
            </div>
          )}

          {activeRun && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="text-xs font-mono text-[#64748B]">Run ID: {activeRun.id}</div>
                  <h3 className="text-base font-bold text-[#0F172A]">{activeRun.datasetName}</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeRun.status === "COMPLETED"
                      ? "bg-[#16A34A]/10 text-[#16A34A]"
                      : activeRun.status === "RUNNING" || activeRun.status === "QUEUED"
                      ? "bg-[#2563EB]/10 text-[#2563EB]"
                      : "bg-[#DC2626]/10 text-[#DC2626]"
                  }`}
                >
                  {activeRun.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#64748B] font-semibold">
                  <span>Progress ({activeRun.currentQuery} / {activeRun.totalQueries} Queries)</span>
                  <span>{activeRun.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${activeRun.progress}%` }} />
                </div>
              </div>

              {activeRun.status === "COMPLETED" && (
                <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                  {activeRun.mode === "Existing Compression Baseline" ? (
                    <div className="p-4 bg-[#D97706]/10 border border-[#D97706]/20 rounded-lg text-xs text-[#D97706] font-semibold">
                      Baseline: N/A — unavailable for custom schema. Execution marked NOT AVAILABLE without fabricated metrics.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-[#F8FAFC] rounded-lg">
                        <div className="text-[11px] text-[#64748B] font-semibold">Token Reduction</div>
                        <div className="text-lg font-bold text-[#16A34A]">{activeRun.avgTokenReduction}%</div>
                      </div>
                      <div className="p-3 bg-[#F8FAFC] rounded-lg">
                        <div className="text-[11px] text-[#64748B] font-semibold">Avg Quality</div>
                        <div className="text-lg font-bold text-[#0F172A]">{activeRun.avgQuality}</div>
                      </div>
                      <div className="p-3 bg-[#F8FAFC] rounded-lg">
                        <div className="text-[11px] text-[#64748B] font-semibold">Cost / Correct Ans</div>
                        <div className="text-sm font-bold text-[#2563EB]">{activeRun.costPerCorrectAnswer || "N/A — correctness unavailable"}</div>
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/app/runs/${activeRun.id}`}
                    className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Inspect Full Run Inspector</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
