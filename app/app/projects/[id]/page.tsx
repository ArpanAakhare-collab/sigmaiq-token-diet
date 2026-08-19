"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderKanban, Loader2, ArrowLeft, Trash2, Save } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [qualityFloor, setQualityFloor] = useState("0.90");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          setName(data.project.name || "");
          setDescription(data.project.description || "");
          setQualityFloor(String(data.project.qualityFloor || 0.90));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, qualityFloor: parseFloat(qualityFloor) }),
      });
      const data = await res.json();
      if (data.project) setProject(data.project);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/app/projects");
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center text-xs text-[#64748B]">Project not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/app/projects")} className="text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-[#0F172A]">Project Settings & Policy</h1>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#0F172A]">Project ID</label>
          <div className="font-mono text-xs text-[#64748B] bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">{project.id}</div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#0F172A]">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#0F172A]">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#0F172A]">Configured Quality Floor (Token-Diet)</label>
          <input
            type="number"
            step="0.05"
            min="0.5"
            max="1.0"
            value={qualityFloor}
            onChange={(e) => setQualityFloor(e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
          />
          <p className="text-[11px] text-[#64748B]">
            RAG context optimization will trigger dynamic evidence relaxation whenever context quality falls below this threshold.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 font-semibold text-xs rounded-lg flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Project
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-lg flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
