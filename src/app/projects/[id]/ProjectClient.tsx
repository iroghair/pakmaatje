"use client";

import { useState } from "react";
import { Project, PackingList, Category, Item, Note, User } from "@prisma/client";
import { ListIcon, FileText, Plus, ArrowLeft, Edit2, Download } from "lucide-react";
import { PackingListBoard } from "./PackingListBoard";
import { NotesBoard } from "./NotesBoard";
import Link from "next/link";

// Type definitions that match Prisma's output with includes
type ItemWithAssignee = Item & { assignee: Partial<User> | null };
type CategoryWithItems = Category & { items: ItemWithAssignee[] };
type ListWithCategories = PackingList & { categories: CategoryWithItems[] };
type FullProject = Project & {
  lists: ListWithCategories[];
  notes: Note[];
};

export function ProjectClient({ 
  initialProject, 
  users, 
  currentUser 
}: { 
  initialProject: FullProject, 
  users: Partial<User>[],
  currentUser: any
}) {
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState<"lists" | "notes">("lists");
  const [activeListId, setActiveListId] = useState<string | null>(
    initialProject.lists.length > 0 ? initialProject.lists[0].id : null
  );

  const canEditProject = project.ownerId === currentUser.id || currentUser.role === "ADMIN";

  const handleEditProject = async () => {
    const newName = prompt("Project Name:", project.name);
    if (!newName) return;
    const newDesc = prompt("Project Description:", project.description || "");
    
    // Optimistic UI
    setProject({ ...project, name: newName, description: newDesc });

    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
  };

  const handleCreateList = async () => {
    const name = prompt("Enter list name (e.g., Summer Gear):");
    if (!name) return;

    const res = await fetch(`/api/projects/${project.id}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const newList = await res.json();
      setProject(prev => ({
        ...prev,
        lists: [...prev.lists, { ...newList, categories: [] }]
      }));
      setActiveListId(newList.id);
    }
  };

  const activeList = project.lists.find(l => l.id === activeListId);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-zinc-800 transition text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="group/proj flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
              {project.description && <p className="text-sm text-zinc-400">{project.description}</p>}
            </div>
            {canEditProject && (
              <button 
                onClick={handleEditProject}
                className="opacity-0 group-hover/proj:opacity-100 p-2 text-zinc-500 hover:text-white transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <a 
          href={`/api/projects/${project.id}/export`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors text-zinc-300"
        >
          <Download className="w-4 h-4" /> Export
        </a>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 shrink-0 mb-4">
        <button
          onClick={() => setActiveTab("lists")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "lists" ? "border-indigo-500 text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ListIcon className="w-4 h-4" /> Lists
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "notes" ? "border-indigo-500 text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileText className="w-4 h-4" /> Notes & Links
        </button>
      </div>

      {activeTab === "lists" && (
        <div className="flex flex-col flex-1 min-h-0 bg-zinc-900/50 rounded-xl border border-zinc-800 p-2 md:p-4 overflow-hidden">
          {/* List Selector */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
            {project.lists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeListId === list.id ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {list.name}
              </button>
            ))}
            <button
              onClick={handleCreateList}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-950 border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> New List
            </button>
          </div>

          {/* Active List Board */}
          {activeList ? (
            <PackingListBoard 
              list={activeList} 
              projectId={project.id} 
              users={users} 
              currentUser={currentUser}
              onListUpdated={(updatedList) => {
                setProject(prev => ({
                  ...prev,
                  lists: prev.lists.map(l => l.id === updatedList.id ? updatedList : l)
                }));
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <ListIcon className="w-12 h-12 mb-4 opacity-50" />
              <p>No lists yet. Create one to get started.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="flex-1 flex flex-col min-h-0">
          <NotesBoard initialNotes={project.notes} projectId={project.id} />
        </div>
      )}
    </div>
  );
}
