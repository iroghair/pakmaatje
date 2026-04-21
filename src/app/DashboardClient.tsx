"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/LocaleProvider";

type ProjectWithCounts = Project & { _count: { lists: number; notes: number } };

export function DashboardClient({ initialProjects }: { initialProjects: ProjectWithCounts[] }) {
  const router = useRouter();
  const messages = useTranslations();
  const [projects] = useState(initialProjects);
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
          className="group relative flex flex-col items-center justify-center min-h-[240px] rounded-2xl border-2 border-dashed border-white/50 bg-white/10 backdrop-blur-md shadow-xl hover:bg-white/20 hover:border-white/70 transition-all text-primary-900 overflow-hidden"
        >
          <div className="w-12 h-12 rounded-full bg-white/40 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-primary-950" />
          </div>
          <span className="font-semibold text-primary-950">{messages.dashboard.newProject}</span>
        </button>

        {/* Project Cards */}
        {projects.map((project) => (
          <Link 
            href={`/projects/${project.id}`} 
            key={project.id}
            className="group relative flex flex-col min-h-[240px] rounded-2xl border border-white/40 bg-white/20 backdrop-blur-md shadow-xl hover:border-white/60 transition-all overflow-hidden"
          >
            <div className="relative h-32 w-full bg-white/20">
              {project.imageUrl ? (
                <Image src={project.imageUrl} alt={project.name} fill className="object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/50 to-accent-500/50" />
              )}
              {project.isPrivate && (
                <span className="absolute top-3 right-3 bg-white/50 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-primary-950 border border-white/40 shadow-sm">
                  {messages.common.private}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-lg mb-1 text-primary-950 group-hover:text-primary-700 transition-colors">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-primary-900/80 line-clamp-2 mb-4 font-medium">{project.description}</p>
              )}
              <div className="mt-auto flex items-center gap-4 text-xs text-primary-900/70 font-bold uppercase tracking-wide">
                <span>{project._count.lists} {messages.common.lists}</span>
                <span>{project._count.notes} {messages.common.notes}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-primary-900 hover:text-primary-950 bg-white/30 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-primary-950">{messages.dashboard.createProjectTitle}</h2>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-primary-950 mb-1">{messages.dashboard.projectName}</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
                  placeholder={messages.dashboard.projectNamePlaceholder}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-primary-950 mb-1">{messages.dashboard.projectDescription}</label>
                <textarea 
                  id="description" 
                  name="description" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all resize-none h-24"
                  placeholder={messages.dashboard.projectDescriptionPlaceholder}
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="isPrivate" 
                  name="isPrivate"
                  className="w-5 h-5 rounded border-gray-300 bg-white text-primary-500 focus:ring-primary-500" 
                />
                <label htmlFor="isPrivate" className="text-sm font-medium text-primary-900">
                  {messages.dashboard.privateProjectLabel}
                </label>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full mt-4 bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {messages.dashboard.creatingProject}</>
                ) : (
                  messages.dashboard.createProject
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
