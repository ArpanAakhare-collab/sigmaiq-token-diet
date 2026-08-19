"use client";

import { useState } from "react";
import { Zap, Loader2, Sparkles, AlertCircle, CheckCircle2, Cpu } from "lucide-react";

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
    if (loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          context: context.trim(),
          expectedAnswer: expectedAnswer.trim(),
          qualityFloor: parseFloat(qualityFloor),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Optimization execution failed. Please try again.");
      }
      setResult(data.result);
    } catch (err: any) {
      console.error("Token-Diet Optimization Error:", err);
      setError(err.message || "Optimization failed. Please check your query input and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Query Analyzer</h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Quality-constrained RAG dynamic context optimizer testbench. Real evidence evaluation & dynamic relaxation.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleOptimize} className="bg-[rgba(8,12,24,0.75)] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#3B82F6]" /> Optimization Parameters
              </h2>
              <span className="text-[10px] bg-[#3B82F6]/10 text-[#22D3EE] border border-[#22D3EE]/20 px-2 py-0.5 rounded font-mono font-bold">
                Token-Diet v1.0
              </span>
            </div>

            {/* Question / User Query Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC]">Question / User Query</label>
              <textarea
                rows={3}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is the refund period..."
                style={{ color: "#0F172A", backgroundColor: "#FFFFFF" }}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-medium placeholder:text-[#94A3B8] placeholder:opacity-100 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all shadow-inner"
              />
            </div>

            {/* Retrieved Context Documents Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC]">Retrieved Context Documents</label>
              <textarea
                rows={7}
                required
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste retrieved document chunks here..."
                style={{ color: "#0F172A", backgroundColor: "#FFFFFF" }}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] font-mono rounded-xl text-xs text-[#0F172A] font-medium placeholder:text-[#94A3B8] placeholder:opacity-100 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all shadow-inner"
              />
            </div>

            {/* Evaluation Target / Ground Truth */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC]">Evaluation Target / Ground Truth (Optional)</label>
              <input
                type="text"
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                placeholder="Target answer for correctness validation..."
                style={{ color: "#0F172A", backgroundColor: "#FFFFFF" }}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-medium placeholder:text-[#94A3B8] placeholder:opacity-100 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all shadow-inner"
              />
            </div>

            {/* Configured Quality Floor */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs font-semibold text-[#F8FAFC]">
                <span>Configured Quality Floor</span>
                <span className="text-[#22D3EE] font-bold font-mono px-2 py-0.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded">
                  {(parseFloat(qualityFloor) * 100).toFixed(0)}% Floor
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="1.00"
                step="0.05"
                value={qualityFloor}
                onChange={(e) => setQualityFloor(e.target.value)}
                className="w-full h-2 bg-[#050816] border border-white/10 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                <span>50% (Max Pruning)</span>
                <span>75%</span>
                <span>100% (Zero Loss)</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-xs flex items-center gap-2 text-[#EF4444]">
                <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
              </div>
            )}

            {/* Optimize Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimizing Context...</span>
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

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-[rgba(8,12,24,0.75)] border border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-xl backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 text-[#22D3EE] flex items-center justify-center mx-auto border border-[#3B82F6]/20">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Ready to Optimize Context</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                Fill in the query and context documents on the left, set your quality floor, and click "Optimize Context" to run the Token-Diet backend pipeline.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-[rgba(8,12,24,0.75)] border border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-xl backdrop-blur-xl">
              <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6] mx-auto" />
              <div className="text-sm font-semibold text-white">Executing Token-Diet Pipeline & Gemini LLM...</div>
              <p className="text-xs text-[#94A3B8]">Evaluating semantic evidence chunks, redundancy, and quality constraints...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="bg-[rgba(8,12,24,0.75)] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#3B82F6]/10 text-[#22D3EE] border border-[#3B82F6]/20 font-bold px-2.5 py-1 rounded">
                      {result.complexity} Complexity
                    </span>
                    <span className="text-xs bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-bold px-2.5 py-1 rounded">
                      Evidence Score: {(result.qualityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-xs text-[#94A3B8] font-mono">Run ID: {result.runId.slice(0, 14)}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-[#050816]/80 rounded-xl border border-white/10">
                    <div className="text-[11px] text-[#94A3B8] font-semibold">Original Tokens</div>
                    <div className="text-lg font-bold text-white">{result.originalTokenCount}</div>
                  </div>
                  <div className="p-3 bg-[#050816]/80 rounded-xl border border-white/10">
                    <div className="text-[11px] text-[#94A3B8] font-semibold">Final Tokens</div>
                    <div className="text-lg font-bold text-[#22D3EE]">{result.finalTokenCount}</div>
                  </div>
                  <div className="p-3 bg-[#050816]/80 rounded-xl border border-white/10">
                    <div className="text-[11px] text-[#94A3B8] font-semibold">Total Latency</div>
                    <div className="text-lg font-bold text-white">{result.totalLatencyMs} ms</div>
                  </div>
                  <div className="p-3 bg-[#050816]/80 rounded-xl border border-white/10">
                    <div className="text-[11px] text-[#94A3B8] font-semibold">Cost / Correct Ans</div>
                    <div className="text-sm font-bold text-[#22C55E] truncate">{result.costPerCorrectAnswer}</div>
                  </div>
                </div>

                <div className="text-xs text-[#94A3B8] border-t border-white/10 pt-3 flex items-center justify-between">
                  <span>Ground Truth Target: <strong className="text-white">{result.groundTruthAgreement}</strong></span>
                  <span>Optimizer Overhead: <strong className="text-[#22C55E]">${result.optimizerCost}</strong></span>
                </div>

                {result.relaxationUsed && (
                  <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl text-xs text-[#F59E0B] space-y-1">
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

              {/* Synthesized Output */}
              <div className="bg-[rgba(8,12,24,0.75)] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Synthesized Answer</span>
                  <span className="text-[10px] bg-[#3B82F6]/10 text-[#22D3EE] border border-[#3B82F6]/20 px-2 py-0.5 rounded font-mono">
                    {result.executionMode}
                  </span>
                </div>
                <div className="p-4 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white leading-relaxed whitespace-pre-wrap">
                  {result.finalAnswer}
                </div>
              </div>

              {/* Retained & Removed Evidence */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[rgba(8,12,24,0.75)] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 backdrop-blur-xl">
                  <div className="text-xs font-bold text-[#22C55E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Retained Evidence ({result.retainedEvidence?.length || 0})
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.retainedEvidence?.map((e: any) => (
                      <div key={e.id} className="p-2.5 bg-[#050816]/80 border border-white/10 rounded-xl text-[11px] space-y-1">
                        <div className="font-semibold text-white">{e.text}</div>
                        <div className="text-[10px] text-[#22C55E] italic">{e.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[rgba(8,12,24,0.75)] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 backdrop-blur-xl">
                  <div className="text-xs font-bold text-[#94A3B8] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Removed Evidence ({result.removedEvidence?.length || 0})
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.removedEvidence?.map((e: any) => (
                      <div key={e.id} className="p-2.5 bg-[#050816]/80 border border-white/10 rounded-xl text-[11px] space-y-1">
                        <div className="font-medium text-[#94A3B8] line-through">{e.text}</div>
                        <div className="text-[10px] text-[#EF4444] italic">{e.rationale}</div>
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
