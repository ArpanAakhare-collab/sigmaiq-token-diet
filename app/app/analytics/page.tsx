"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Clock, Zap, Activity, Loader2, ShieldCheck } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((res) => setData(res.analytics || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
        <div className="text-xs text-[#64748B] mt-2">Computing real backend telemetry...</div>
      </div>
    );
  }

  const a = data || {};

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E2E8F0] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Platform Analytics</h1>
        <p className="text-xs text-[#64748B] mt-1">
          Real computed metrics from Token-Diet RAG runs and Alert Fatigue Reducer incidents stored in Firestore.
        </p>
      </div>

      {/* Primary Financial & Optimization KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Token Reduction</span>
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-bold text-[#16A34A]">{a.tokenReductionPercentage || 0}%</div>
          <div className="text-[11px] text-[#64748B]">{a.totalSavedTokens || 0} Tokens Saved</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Cost / Correct Answer</span>
            <DollarSign className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-lg font-bold text-[#0F172A]">
            {typeof a.costPerCorrectAnswer === "number" ? `$${a.costPerCorrectAnswer}` : a.costPerCorrectAnswer || "N/A — correctness unavailable"}
          </div>
          <div className="text-[11px] text-[#64748B]">Evaluated Ground Truth Target</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Heuristic Quality Floor</span>
            <Activity className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{a.avgQualityScore || 0}</div>
          <div className="text-[11px] text-[#64748B]">Evidence Coverage Score</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>Alert Noise Reduction</span>
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-bold text-[#16A34A]">{a.noiseReductionPercentage || 0}%</div>
          <div className="text-[11px] text-[#64748B]">
            {a.totalAlertsCount || 0} Signals $\rightarrow$ {a.incidentsCount || 0} Incidents
          </div>
        </div>
      </div>

      {/* Visual Telemetric Breakdown Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#2563EB]" /> Token Context Compression
          </h3>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#0F172A]">
                <span>Original Context Tokens</span>
                <span>{a.totalOriginalTokens || 0} Tokens</span>
              </div>
              <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#64748B] w-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#2563EB]">
                <span>Optimized Context Tokens</span>
                <span>{a.totalFinalTokens || 0} Tokens</span>
              </div>
              <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] transition-all duration-500"
                  style={{
                    width: `${
                      a.totalOriginalTokens > 0
                        ? Math.min(100, (a.totalFinalTokens / a.totalOriginalTokens) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" /> Telemetry & Disclosures
          </h3>
          <div className="space-y-3 text-xs pt-1">
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <span className="font-semibold text-[#0F172A]">Avg Total Latency</span>
              <span className="font-bold text-[#2563EB]">{a.avgLatencyMs || 0} ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <span className="font-semibold text-[#0F172A]">Dynamic Relaxation Rate</span>
              <span className="font-bold text-[#D97706]">{a.relaxationRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
              <span className="font-semibold text-[#0F172A]">Correlation Precision</span>
              <span className="font-bold text-[#64748B]">N/A — ground truth dataset required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
