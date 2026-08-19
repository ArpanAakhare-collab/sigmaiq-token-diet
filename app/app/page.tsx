"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Zap,
  BarChart2,
  Sparkles,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
  Loader2,
  Database,
  CheckCircle2,
  Clock,
  History as HistoryIcon,
  DollarSign,
  Cpu,
} from "lucide-react";

export default function OverviewDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, projectsRes, datasetsRes, runsRes] = await Promise.all([
        fetch("/api/analytics").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
        fetch("/api/datasets").then((r) => r.json()),
        fetch("/api/runs").then((r) => r.json()),
      ]);

      setAnalytics(analyticsRes.analytics || null);
      setProjects(projectsRes.projects || []);
      setDatasets(datasetsRes.datasets || []);
      setRuns(runsRes.runs || []);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleGenerateSynthetic = async () => {
    setGeneratingDemo(true);
    setDemoMessage(null);
    try {
      const res = await fetch("/api/synthetic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dataset" }),
      });
      const data = await res.json();
      setDemoMessage(data.message || "Synthetic RAG demo dataset generated!");
      await fetchOverviewData();
    } catch (e: any) {
      setDemoMessage("Synthetic generation error: " + e.message);
    } finally {
      setGeneratingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
        <div className="text-sm font-medium text-[#64748B]">Loading workspace overview from Firestore...</div>
      </div>
    );
  }

  const hasActivity = (analytics?.totalQueriesProcessed || 0) > 0 || runs.length > 0;
  const latestRun = runs.length > 0 ? runs[0] : null;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Workspace Overview</h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time telemetry for Token-Diet RAG context optimizer and benchmark evaluations.
          </p>
        </div>

        <button
          onClick={handleGenerateSynthetic}
          disabled={generatingDemo}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          {generatingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate RAG Demo Dataset</span>
        </button>
      </div>

      {demoMessage && (
        <div className="p-3 bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] rounded-lg text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {demoMessage} (Processed through real backend pipeline)
          </span>
          <span className="text-[10px] bg-[#16A34A]/20 px-2 py-0.5 rounded font-semibold uppercase">
            Synthetic Demo Data
          </span>
        </div>
      )}

      {/* Workspace Counts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-[#64748B] flex items-center justify-between">
            <span>Projects</span>
            <FolderKanban className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{projects.length}</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-[#64748B] flex items-center justify-between">
            <span>Datasets</span>
            <Database className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{datasets.length}</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-[#64748B] flex items-center justify-between">
            <span>Completed Runs</span>
            <BarChart2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-bold text-[#16A34A]">{runs.filter((r) => r.status === "COMPLETED").length}</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-1">
          <div className="text-xs font-semibold text-[#64748B] flex items-center justify-between">
            <span>Latest Run</span>
            <HistoryIcon className="w-4 h-4 text-[#64748B]" />
          </div>
          <div className="text-sm font-bold text-[#0F172A] truncate">
            {latestRun ? latestRun.id.slice(0, 12) : "None"}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {latestRun ? new Date(latestRun.startedAt || latestRun.createdAt).toLocaleTimeString() : "No runs executed"}
          </div>
        </div>
      </div>

      {/* Optimization Telemetry Grid */}
      {!hasActivity ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-[#2563EB]/10 text-[#2563EB] rounded-full flex items-center justify-center mx-auto">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">No benchmark results yet.</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Create a project and run your first benchmark to compute real token reduction and cost telemetry.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/app/projects"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-sm transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Avg Token Reduction</span>
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="text-3xl font-bold text-[#16A34A]">
              {analytics?.tokenReductionPercentage || 0}%
            </div>
            <div className="text-xs text-[#64748B]">{analytics?.totalSavedTokens || 0} Tokens Saved</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Avg Evidence Quality</span>
              <Activity className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-bold text-[#0F172A]">
              {analytics?.avgQualityScore || 0}
            </div>
            <div className="text-xs text-[#64748B]">Evidence Coverage Score</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Cost / Correct Answer</span>
              <DollarSign className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-xl font-bold text-[#0F172A]">
              {typeof analytics?.costPerCorrectAnswer === "number" ? `$${analytics.costPerCorrectAnswer}` : analytics?.costPerCorrectAnswer || "N/A — correctness unavailable"}
            </div>
            <div className="text-xs text-[#64748B]">Evaluated Ground Truth Target</div>
          </div>
        </div>
      )}
    </div>
  );
}
