"use client";

import { useState, useEffect } from "react";
import { Database, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Multi-document");
  const [format, setFormat] = useState("JSON");
  const [rawData, setRawData] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<any | null>(null);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/datasets");
      const data = await res.json();
      setDatasets(data.datasets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setValidationReport(null);

    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, rawData, format }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationReport(data);
        throw new Error(data.error || "Dataset validation failed");
      }

      setShowModal(false);
      setName("");
      setRawData("");
      await fetchDatasets();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete dataset?")) return;
    try {
      await fetch(`/api/datasets/${id}`, { method: "DELETE" });
      await fetchDatasets();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Datasets</h1>
          <p className="text-xs text-[#64748B] mt-1">
            RAG context evaluation suites and benchmark dataset repositories stored in Firestore.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Upload Dataset
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
        </div>
      ) : datasets.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-3 shadow-sm">
          <Database className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-[#0F172A]">No datasets registered yet.</h3>
          <p className="text-xs text-[#64748B]">
            Upload a JSON or JSONL dataset or generate a synthetic RAG suite from the Overview dashboard.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((d) => (
            <div key={d.id} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-[#0F172A]">{d.name}</span>
                  <span className="text-xs bg-[#2563EB]/10 text-[#2563EB] font-semibold px-2 py-0.5 rounded">
                    {d.category || "RAG Suite"}
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">{d.description || `${d.itemCount || 0} evaluation queries`}</p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-mono">{d.items?.length || d.itemCount || 0} Valid Records</span>
                <button onClick={() => handleDelete(d.id)} className="text-[#64748B] hover:text-[#DC2626]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#0F172A]">Upload & Validate Dataset</h2>
            {error && (
              <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] rounded text-xs space-y-1">
                <div className="font-semibold">{error}</div>
                {validationReport && (
                  <div className="text-[11px] font-mono">
                    Total: {validationReport.totalRecords} | Valid: {validationReport.validRecords} | Invalid: {validationReport.invalidRecords}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Dataset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Enterprise Security RAG Benchmark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Simple factual">Simple factual</option>
                    <option value="Multi-document">Multi-document</option>
                    <option value="Multi-hop">Multi-hop</option>
                    <option value="Noisy retrieval">Noisy retrieval</option>
                    <option value="Long context">Long context</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A]">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="JSON">JSON Array</option>
                    <option value="JSONL">JSONL (Lines)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Raw Dataset Content (JSON / JSONL)</label>
                <textarea
                  rows={8}
                  required
                  placeholder={`[\n  {\n    "id": "q1",\n    "question": "What is the refund period?",\n    "context": "Refunds are allowed within 30 days.",\n    "ground_truth": "30 days"\n  }\n]`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] font-mono text-xs rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-[#E2E8F0] text-xs font-semibold rounded-lg text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg flex items-center gap-2"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Validate & Upload</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
