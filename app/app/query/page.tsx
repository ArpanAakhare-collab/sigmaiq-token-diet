"use client";

import { useState } from "react";
import { Zap, Loader2, Sparkles, AlertCircle, CheckCircle2, DollarSign, Clock, Cpu } from "lucide-react";

export default function QueryAnalyzerPage() {
  const [question, setQuestion] = useState(
    "What is the refund period and what exceptions apply to enterprise customers?"
  );
  const [context, setContext] = useState(
    `Document 1: Standard customer refund policy permits returns within 30 days of purchase. Refunds must be submitted via customer portal.\n\nDocument 2: For enterprise customers, refund conditions are governed by Master Services Agreement section 4.2. Enterprise clients receive a 60-day refund exception window upon written notice to executive management.\n\nDocument 3: All standard items are subject to a 5% restocking fee unless defective.`
  );
  const [expectedAnswer, setExpectedAnswer] = useState(
    "Enterprise customers receive a 60-day refund exception window per MSA section 4.2."
  );
  const [qualityFloor, setQualityFloor] = useState("0.90");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context,
          expectedAnswer,
          qualityFloor: parseFloat(qualityFloor),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization execution failed");
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E2E8F0] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Query Analyzer</h1>
        <p className="text-xs text-[#64748B] mt-1">
          Quality-constrained RAG dynamic context optimizer testbench. Real evidence evaluation & dynamic relaxation.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleOptimize} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2563EB]" /> Optimization Parameters
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Question / User Query</label>
              <textarea
                rows={3}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Retrieved Context Documents</label>
              <textarea
                rows={7}
                required
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] font-mono rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0F172A]">Evaluation Target / Ground Truth (Optional)</label>
              <input
                type="text"
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                placeholder="Target answer for correctness validation..."
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-[#0F172A]">
                <span>Configured Quality Floor</span>
                <span className="text-[#2563EB] font-bold">{(parseFloat(qualityFloor) * 100).toFixed(0)}% Floor</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="1.00"
                step="0.05"
                value={qualityFloor}
                onChange={(e) => setQualityFloor(e.target.value)}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
            </div>

            {error && (
              <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Token-Diet Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Optimize Context</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-3 shadow-sm">
              <Cpu className="w-10 h-10 text-[#64748B] mx-auto" />
              <h3 className="text-base font-bold text-[#0F172A]">Ready to Optimize Context</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Fill in the query and context documents, then click "Optimize Context" to run real backend evaluation.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-4 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
              <div className="text-sm font-semibold text-[#0F172A]">Token-Diet Pipeline Executing</div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#2563EB]/10 text-[#2563EB] font-bold px-2.5 py-1 rounded">
                      {result.complexity} Complexity
                    </span>
                    <span className="text-xs bg-[#16A34A]/10 text-[#16A34A] font-bold px-2.5 py-1 rounded">
                      Evidence Score: {(result.qualityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">Run ID: {result.runId.slice(0, 14)}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[11px] text-[#64748B] font-semibold">Original Tokens</div>
                    <div className="text-lg font-bold text-[#0F172A]">{result.originalTokenCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B] font-semibold">Final Tokens</div>
                    <div className="text-lg font-bold text-[#2563EB]">{result.finalTokenCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B] font-semibold">Total Latency</div>
                    <div className="text-lg font-bold text-[#0F172A]">{result.totalLatencyMs} ms</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#64748B] font-semibold">Cost / Correct Ans</div>
                    <div className="text-sm font-bold text-[#16A34A]">{result.costPerCorrectAnswer}</div>
                  </div>
                </div>

                <div className="text-xs text-[#64748B] border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                  <span>Ground Truth Target: <strong className="text-[#0F172A]">{result.groundTruthAgreement}</strong></span>
                  <span>Optimizer Overhead: <strong className="text-[#16A34A]">${result.optimizerCost}</strong></span>
                </div>

                {result.relaxationUsed && (
                  <div className="p-3 bg-[#D97706]/10 border border-[#D97706]/20 rounded-lg text-xs text-[#D97706] space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" /> Dynamic Relaxation Triggered
                    </div>
                    {result.relaxationEvents?.map((ev: any, idx: number) => (
                      <div key={idx} className="text-[11px]">
                        Iteration #{ev.iteration}: {ev.reason} (Quality restored to {ev.qualityAfter})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Synthesized Answer */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                  <span>Synthesized Output</span>
                  <span className="text-[10px] bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded font-mono">
                    {result.executionMode}
                  </span>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                  {result.finalAnswer}
                </div>
              </div>

              {/* Retained & Removed Evidence */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Retained Evidence ({result.retainedEvidence?.length || 0})
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.retainedEvidence?.map((e: any) => (
                      <div key={e.id} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] space-y-1">
                        <div className="font-semibold text-[#0F172A]">{e.text}</div>
                        <div className="text-[10px] text-[#16A34A] italic">{e.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-[#64748B] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Removed Evidence ({result.removedEvidence?.length || 0})
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.removedEvidence?.map((e: any) => (
                      <div key={e.id} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] space-y-1">
                        <div className="font-medium text-[#64748B] line-through">{e.text}</div>
                        <div className="text-[10px] text-[#DC2626] italic">{e.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
