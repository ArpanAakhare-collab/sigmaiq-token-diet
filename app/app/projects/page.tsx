"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Trash2, ArrowUpRight, Loader2, CheckCircle2 } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [qualityFloor, setQualityFloor] = useState("0.90");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      console.error("Projects fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, qualityFloor: parseFloat(qualityFloor) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      setShowModal(false);
      setName("");
      setDescription("");
      await fetchProjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      await fetchProjects();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Projects</h1>
          <p className="text-xs text-[#64748B] mt-1">
            Organize engineering workspaces, Token-Diet quality floors, and incident policies.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
          <div className="text-xs text-[#64748B] mt-2">Loading projects from Firestore...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-3">
          <FolderKanban className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-[#0F172A]">No projects created yet.</h3>
          <p className="text-xs text-[#64748B]">Click "Create Project" to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-[#0F172A]">{p.name}</span>
                  <span className="text-xs bg-[#2563EB]/10 text-[#2563EB] font-semibold px-2 py-0.5 rounded">
                    Floor: &ge; {p.qualityFloor}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] line-clamp-2">{p.description}</p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <Link href={`/app/projects/${p.id}`} className="text-[#2563EB] font-semibold hover:underline flex items-center gap-1">
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-[#64748B] hover:text-[#DC2626] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#0F172A]">Create New Project</h2>
            {error && <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] rounded text-xs">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Enterprise Checkout RAG Pipeline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Description</label>
                <textarea
                  rows={3}
                  placeholder="Project rationale and microservice scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A]">Default Quality Floor</label>
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
                  disabled={creating}
                  className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
