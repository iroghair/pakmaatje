"use client";

import { useState } from "react";
import { Project, PackingList, Category, Item, Note, User } from "@prisma/client";
import { ListIcon, FileText, Plus, ArrowLeft, Edit2, Download, Copy, RefreshCcw } from "lucide-react";
import { PackingListBoard } from "./PackingListBoard";
import { NotesBoard } from "./NotesBoard";
import Link from "next/link";
import { useTranslations } from "@/components/LocaleProvider";

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
  currentUser: Pick<User, "id" | "role">
}) {
  const messages = useTranslations();
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState<"lists" | "notes">("lists");
  const [activeListId, setActiveListId] = useState<string | null>(
    initialProject.lists.length > 0 ? initialProject.lists[0].id : null
  );

  const canEditProject = project.ownerId === currentUser.id || currentUser.role === "ADMIN";

  const handleEditProject = async () => {
    const newName = prompt(messages.project.prompts.projectName, project.name);
    if (!newName) return;
    const newDesc = prompt(messages.project.prompts.projectDescription, project.description || "");
    
    // Optimistic UI
    setProject({ ...project, name: newName, description: newDesc });

    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
  };

  const handleCreateList = async () => {
    const name = prompt(messages.project.prompts.createList);
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

  const handleRenameList = async () => {
    if (!activeList) return;
    const newName = prompt(messages.project.prompts.renameList, activeList.name);
    if (!newName || newName === activeList.name) return;

    setProject(prev => ({
      ...prev,
      lists: prev.lists.map(l => l.id === activeList.id ? { ...l, name: newName } : l)
    }));

    await fetch(`/api/projects/${project.id}/lists/${activeList.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
  };

  const handleDuplicateList = async () => {
    if (!activeList) return;
    const newName = prompt(messages.project.prompts.duplicateList, `${activeList.name}${messages.project.prompts.duplicateSuffix}`);
    if (!newName) return;

    const res = await fetch(`/api/projects/${project.id}/lists/${activeList.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      const newList = await res.json();
      setProject(prev => ({
        ...prev,
        lists: [...prev.lists, newList]
      }));
      setActiveListId(newList.id);
    }
  };

  const handleResetList = async () => {
    if (!activeList) return;
    const confirmReset = window.confirm(messages.project.prompts.resetConfirm);
    if (!confirmReset) return;

    // Optimistic UI
    const updatedList = {
      ...activeList,
      categories: activeList.categories.map(c => ({
        ...c,
        items: c.items.map(i => ({ ...i, stagedCount: 0, packedCount: 0 }))
      }))
    };

    setProject(prev => ({
      ...prev,
      lists: prev.lists.map(l => l.id === activeList.id ? updatedList : l)
    }));

    await fetch(`/api/projects/${project.id}/lists/${activeList.id}/reset`, {
      method: "POST",
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-white/30 bg-white/10 backdrop-blur-md border border-white/30 transition text-primary-900 hover:text-primary-950">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="group/proj flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary-950 drop-shadow-sm">{project.name}</h1>
              {project.description && <p className="text-sm text-primary-900/80 font-medium">{project.description}</p>}
            </div>
            {canEditProject && (
              <button 
                onClick={handleEditProject}
                className="opacity-0 group-hover/proj:opacity-100 p-2 text-primary-800 hover:text-primary-950 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <a 
          href={`/api/projects/${project.id}/export`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/30 rounded-xl text-sm font-bold transition-colors text-primary-950"
        >
          <Download className="w-4 h-4" /> {messages.common.export}
        </a>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/30 shrink-0 mb-4">
        <button
          onClick={() => setActiveTab("lists")}
          className={`flex items-center gap-2 px-4 py-3 border-b-[3px] font-bold text-sm transition-colors ${
            activeTab === "lists" ? "border-primary-500 text-primary-950" : "border-transparent text-primary-900/60 hover:text-primary-900/90"
          }`}
        >
          <ListIcon className="w-4 h-4" /> {messages.project.listsTab}
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-2 px-4 py-3 border-b-[3px] font-bold text-sm transition-colors ${
            activeTab === "notes" ? "border-primary-500 text-primary-950" : "border-transparent text-primary-900/60 hover:text-primary-900/90"
          }`}
        >
          <FileText className="w-4 h-4" /> {messages.project.notesTab}
        </button>
      </div>

      {activeTab === "lists" && (
        <div className="flex flex-col flex-1 min-h-0 bg-white/10 backdrop-blur-md shadow-xl rounded-2xl border border-white/30 p-2 md:p-4 overflow-hidden">
          {/* List Selector */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
            {project.lists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                  activeListId === list.id ? "bg-primary-500 text-white border border-primary-400" : "bg-white/40 text-primary-950 border border-white/50 hover:bg-white/60"
                }`}
              >
                {list.name}
              </button>
            ))}
            <button
              onClick={handleCreateList}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 border-2 border-dashed border-primary-900/30 text-primary-900 hover:text-primary-950 hover:bg-white/30 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> {messages.project.newList}
            </button>
          </div>

          {/* Active List Board */}
          {activeList ? (
            <>
              {/* List Action Bar */}
              <div className="flex flex-wrap items-center gap-2 mb-4 px-2 pb-3 border-b border-white/20 shrink-0">
                <h2 className="text-xl font-extrabold text-primary-950 mr-2 drop-shadow-sm">{activeList.name}</h2>
                <button onClick={handleRenameList} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/30 hover:bg-white/50 border border-white/50 rounded-xl text-xs font-bold text-primary-950 shadow-sm transition-all">
                  <Edit2 className="w-3.5 h-3.5" /> {messages.common.rename}
                </button>
                <button onClick={handleDuplicateList} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/30 hover:bg-white/50 border border-white/50 rounded-xl text-xs font-bold text-primary-950 shadow-sm transition-all">
                  <Copy className="w-3.5 h-3.5" /> {messages.common.duplicate}
                </button>
                <button onClick={handleResetList} className="flex items-center gap-1.5 px-3 py-1.5 bg-analogous1-500/20 hover:bg-analogous1-500/30 border border-analogous1-500/40 rounded-xl text-xs font-bold text-analogous1-700 shadow-sm transition-all ml-auto">
                  <RefreshCcw className="w-3.5 h-3.5" /> {messages.project.resetPacking}
                </button>
              </div>
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-primary-900/60">
              <ListIcon className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">{messages.project.noLists}</p>
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
