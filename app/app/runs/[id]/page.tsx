"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/runs/${id}`)
      .then((r) => r.json())
      .then((data) => setRun(data.run || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
      </div>
    );
  }

  if (!run) {
    return <div className="p-8 text-center text-xs text-[#64748B]">Run record not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/app/runs")} className="text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Run Inspector</h1>
          <div className="text-xs font-mono text-[#64748B]">{run.id}</div>
        </div>
      </div>

      {/* Summary KPI Panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <h3 className="font-bold text-base text-[#0F172A]">{run.datasetName || "Benchmark Suite"}</h3>
          <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-[#16A34A]/10 text-[#16A34A]">
            {run.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-[#F8FAFC] rounded-lg">
            <div className="text-[11px] text-[#64748B] font-semibold">Mode</div>
            <div className="text-sm font-bold text-[#2563EB]">{run.mode || "Token-Diet"}</div>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-lg">
            <div className="text-[11px] text-[#64748B] font-semibold">Average Quality</div>
            <div className="text-sm font-bold text-[#0F172A]">{run.avgQuality || run.qualityScore || "—"}</div>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-lg">
            <div className="text-[11px] text-[#64748B] font-semibold">Tokens Saved</div>
            <div className="text-sm font-bold text-[#16A34A]">{run.totalTokensSaved || 0}</div>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-lg">
            <div className="text-[11px] text-[#64748B] font-semibold">Cost / Correct Ans</div>
            <div className="text-sm font-bold text-[#0F172A]">${run.costPerCorrectAnswer || "0.0000"}</div>
          </div>
        </div>
      </div>

      {/* Query Results List */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-[#0F172A]">Query Execution Results ({run.results?.length || 0})</h3>

        {!run.results || run.results.length === 0 ? (
          <div className="text-xs text-[#64748B] italic py-4">No detailed query results recorded.</div>
        ) : (
          <div className="space-y-4">
            {run.results.map((res: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#0F172A] font-bold">Query #{idx + 1}: {res.question}</span>
                  {res.qualityScore && (
                    <span className="text-xs bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold">
                      Quality: {(res.qualityScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {res.finalAnswer && (
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded text-[#0F172A]">
                    <div className="text-[10px] text-[#64748B] font-semibold uppercase mb-1">Answer</div>
                    <div>{res.finalAnswer}</div>
                  </div>
                )}

                {res.note && (
                  <div className="p-2 bg-[#D97706]/10 text-[#D97706] rounded text-[11px]">
                    {res.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
