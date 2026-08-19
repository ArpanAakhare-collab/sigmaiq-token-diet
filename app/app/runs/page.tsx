"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, ArrowUpRight, Loader2 } from "lucide-react";

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((data) => setRuns(data.runs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E2E8F0] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Run History</h1>
        <p className="text-xs text-[#64748B] mt-1">
          Historical record of Token-Diet benchmark evaluations and context optimization runs stored in Firestore.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
          <div className="text-xs text-[#64748B] mt-2">Loading run records from Firestore...</div>
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-[#0F172A]">No benchmark runs recorded yet.</h3>
          <p className="text-xs text-[#64748B]">
            Launch a benchmark job or run synthetic datasets to populate execution history.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-semibold text-[#475569]">
                <tr>
                  <th className="p-3">Run ID</th>
                  <th className="p-3">Dataset</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Queries</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">Tokens Saved</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Started</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3 font-mono font-semibold text-[#0F172A]">{r.id.slice(0, 14)}</td>
                    <td className="p-3 font-medium text-[#0F172A]">{r.datasetName || "Benchmark Suite"}</td>
                    <td className="p-3 text-[#2563EB] font-medium">{r.mode || "Token-Diet"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === "COMPLETED"
                            ? "bg-[#16A34A]/10 text-[#16A34A]"
                            : r.status === "RUNNING"
                            ? "bg-[#2563EB]/10 text-[#2563EB]"
                            : "bg-[#DC2626]/10 text-[#DC2626]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#64748B]">{r.totalQueries || 0}</td>
                    <td className="p-3 font-semibold text-[#0F172A]">{r.avgQuality || r.qualityScore || "—"}</td>
                    <td className="p-3 text-[#16A34A] font-semibold">{r.totalTokensSaved || r.tokensSaved || "0"}</td>
                    <td className="p-3 text-[#0F172A]">${r.totalCost || "0.0000"}</td>
                    <td className="p-3 text-[#64748B]">{new Date(r.startedAt || r.createdAt).toLocaleTimeString()}</td>
                    <td className="p-3 text-right">
                      <Link href={`/app/runs/${r.id}`} className="text-[#2563EB] font-semibold hover:underline inline-flex items-center gap-1">
                        View <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
