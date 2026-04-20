"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@prisma/client";
import { useRouter } from "next/navigation";

type ProjectWithCounts = Project & { _count: { lists: number; notes: number } };

export function DashboardClient({ initialProjects, userId }: { initialProjects: ProjectWithCounts[], userId: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isPrivate = formData.get("isPrivate") === "on";

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isPrivate }),
      });

      if (res.ok) {
        const newProject = await res.json();
        router.push(`/projects/${newProject.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Create New Project Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative flex flex-col items-center justify-center min-h-[240px] rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-zinc-400 hover:text-white overflow-hidden"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">New Project</span>
        </button>

        {/* Project Cards */}
        {projects.map((project) => (
          <Link 
            href={`/projects/${project.id}`} 
            key={project.id}
            className="group relative flex flex-col min-h-[240px] rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-all overflow-hidden"
          >
            <div className="relative h-32 w-full bg-zinc-800">
              {project.imageUrl ? (
                <Image src={project.imageUrl} alt={project.name} fill className="object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40" />
              )}
              {project.isPrivate && (
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium border border-zinc-700/50">
                  Private
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-400 transition-colors">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{project.description}</p>
              )}
              <div className="mt-auto flex items-center gap-4 text-xs text-zinc-500 font-medium">
                <span>{project._count.lists} Lists</span>
                <span>{project._count.notes} Notes</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-1">Project Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="e.g. Bikepacking 2026"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-400 mb-1">Description (Optional)</label>
                <textarea 
                  id="description" 
                  name="description" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none h-24"
                  placeholder="A short description of this project..."
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="isPrivate" 
                  name="isPrivate"
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900" 
                />
                <label htmlFor="isPrivate" className="text-sm text-zinc-300">
                  Make this project private (only visible to you)
                </label>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full mt-4 bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                ) : (
                  "Create Project"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
