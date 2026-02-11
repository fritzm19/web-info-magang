"use client";

import { useState, useEffect } from "react";
import { Github, Globe, ExternalLink, Edit2, Check, X } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  repoLink: string | null;
  deploymentUrl: string | null;
  members: { user: { name: string }, role: string }[];
};

export default function AdminProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");

  const fetchProjects = async () => {
    const res = await fetch("/api/admin/projects");
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditUrl(project.deploymentUrl || "");
  };

  const saveEdit = async (id: string) => {
    const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deploymentUrl: editUrl })
    });

    if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, deploymentUrl: editUrl } : p));
        setEditingId(null);
    } else {
        alert("Gagal update link");
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Monitoring Project</h1>
        <p className="text-gray-500 text-sm">Review project peserta dan tambahkan link deployment.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? <p>Loading...</p> : projects.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                
                {/* Info Section */}
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{p.title}</h3>
                    <div className="flex flex-wrap gap-2 my-2">
                        {p.members.map((m, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                {m.user.name} ({m.role})
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                    
                    {/* Repo Link */}
                    {p.repoLink && (
                        <a href={p.repoLink} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 mt-3 hover:underline">
                            <Github size={12} /> Repository
                        </a>
                    )}
                </div>

                {/* Action Section (Deployment Link) */}
                <div className="md:w-1/3 flex flex-col items-end justify-center border-l border-gray-50 pl-6">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Deployment URL</p>
                    
                    {editingId === p.id ? (
                        <div className="flex items-center gap-2 w-full">
                            <input 
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="w-full text-sm border rounded px-2 py-1"
                                placeholder="https://..."
                            />
                            <button onClick={() => saveEdit(p.id)} className="p-1 bg-green-100 text-green-600 rounded"><Check size={14}/></button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-red-100 text-red-600 rounded"><X size={14}/></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {p.deploymentUrl ? (
                                <a href={p.deploymentUrl} target="_blank" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">
                                    <Globe size={14} />  <ExternalLink size={12}/>
                                </a>
                            ) : (
                                <span className="text-sm text-gray-400 italic">Belum deploy</span>
                            )}
                            <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-gray-600" title="Edit Link">
                                <Edit2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

            </div>
        ))}
      </div>
    </div>
  );
}