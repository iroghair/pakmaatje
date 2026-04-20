"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, User as UserIcon } from "lucide-react";
import Image from "next/image";

type PackingListBoardProps = {
  list: any; // Using any here to avoid complex type importing issues, but it matches ListWithCategories
  projectId: string;
  users: any[];
  currentUser: any;
  onListUpdated: (updatedList: any) => void;
};

export function PackingListBoard({ list, projectId, users, currentUser, onListUpdated }: PackingListBoardProps) {
  const [localList, setLocalList] = useState(list);

  // Status mapping
  const nextStatus = {
    UNPACKED: "STAGED",
    STAGED: "PACKED",
    PACKED: "UNPACKED"
  } as Record<string, string>;

  const statusIcons = {
    UNPACKED: "O",
    STAGED: "-",
    PACKED: "X"
  } as Record<string, string>;

  const statusColors = {
    UNPACKED: "text-zinc-500 border-zinc-600",
    STAGED: "text-yellow-500 border-yellow-500/50 bg-yellow-500/10",
    PACKED: "text-green-500 border-green-500/50 bg-green-500/10"
  } as Record<string, string>;

  const handleCreateCategory = async () => {
    const name = prompt("Enter category name (e.g., Sleeping, Tools):");
    if (!name) return;

    const res = await fetch(`/api/projects/${projectId}/lists/${list.id}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const newCategory = await res.json();
      const updatedList = {
        ...localList,
        categories: [...localList.categories, newCategory]
      };
      setLocalList(updatedList);
      onListUpdated(updatedList);
    }
  };

  const handleCreateItem = async (categoryId: string) => {
    const name = prompt("Enter item name:");
    if (!name) return;

    const res = await fetch(`/api/projects/${projectId}/lists/${list.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryId }),
    });

    if (res.ok) {
      const newItem = await res.json();
      const updatedCategories = localList.categories.map((c: any) => {
        if (c.id === categoryId) {
          return { ...c, items: [...c.items, newItem] };
        }
        return c;
      });
      const updatedList = { ...localList, categories: updatedCategories };
      setLocalList(updatedList);
      onListUpdated(updatedList);
    }
  };

  const handleToggleStatus = async (item: any, categoryId: string) => {
    const newStatus = nextStatus[item.packStatus];
    
    // Optimistic UI update
    const updatedCategories = localList.categories.map((c: any) => {
      if (c.id === categoryId) {
        return {
          ...c,
          items: c.items.map((i: any) => i.id === item.id ? { ...i, packStatus: newStatus } : i)
        };
      }
      return c;
    });
    setLocalList({ ...localList, categories: updatedCategories });

    // API Call
    await fetch(`/api/projects/${projectId}/lists/${list.id}/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, packStatus: newStatus }),
    });
  };

  const handleAssigneeChange = async (item: any, categoryId: string, assigneeId: string | null) => {
    // Optimistic UI update
    const assigneeObj = assigneeId ? users.find(u => u.id === assigneeId) : null;
    const updatedCategories = localList.categories.map((c: any) => {
      if (c.id === categoryId) {
        return {
          ...c,
          items: c.items.map((i: any) => i.id === item.id ? { ...i, assigneeId, assignee: assigneeObj } : i)
        };
      }
      return c;
    });
    setLocalList({ ...localList, categories: updatedCategories });

    // API Call
    await fetch(`/api/projects/${projectId}/lists/${list.id}/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, assigneeId: assigneeId || null }),
    });
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Deep copy categories
    const newCategories = JSON.parse(JSON.stringify(localList.categories));
    
    const sourceCatIndex = newCategories.findIndex((c: any) => c.id === source.droppableId);
    const destCatIndex = newCategories.findIndex((c: any) => c.id === destination.droppableId);
    
    const sourceItems = newCategories[sourceCatIndex].items;
    const destItems = newCategories[destCatIndex].items;

    const [movedItem] = sourceItems.splice(source.index, 1);
    
    if (source.droppableId !== destination.droppableId) {
      movedItem.categoryId = destination.droppableId;
    }
    
    destItems.splice(destination.index, 0, movedItem);

    const updatedList = { ...localList, categories: newCategories };
    setLocalList(updatedList);

    if (source.droppableId !== destination.droppableId) {
      await fetch(`/api/projects/${projectId}/lists/${list.id}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: draggableId, categoryId: destination.droppableId }),
      });
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden hide-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex items-start gap-4 h-full pb-4">
          {localList.categories.map((category: any) => (
            <div key={category.id} className="flex-shrink-0 w-80 max-h-full flex flex-col bg-zinc-950/50 rounded-xl border border-zinc-800">
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md rounded-t-xl z-10">
                <h3 className="font-semibold">{category.name}</h3>
                <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">
                  {category.items.length}
                </span>
              </div>
              
              <Droppable droppableId={category.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={`flex-1 p-2 overflow-y-auto min-h-[150px] transition-colors ${
                      snapshot.isDraggingOver ? "bg-indigo-900/10" : ""
                    }`}
                  >
                    {category.items.map((item: any, index: number) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group flex flex-col gap-2 p-3 mb-2 rounded-lg border transition-all ${
                              snapshot.isDragging 
                                ? "bg-zinc-800 border-indigo-500/50 shadow-xl shadow-indigo-900/20 rotate-2 scale-105" 
                                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <button 
                                onClick={() => handleToggleStatus(item, category.id)}
                                className={`w-6 h-6 shrink-0 rounded flex items-center justify-center border font-mono text-xs font-bold transition-colors ${statusColors[item.packStatus]}`}
                              >
                                {statusIcons[item.packStatus]}
                              </button>
                              <span className={`flex-1 text-sm font-medium ${item.packStatus === 'PACKED' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                {item.name}
                              </span>
                            </div>

                            {/* Assignee Footer */}
                            <div className="flex justify-end mt-1">
                              <select 
                                value={item.assigneeId || ""}
                                onChange={(e) => handleAssigneeChange(item, category.id, e.target.value)}
                                className="bg-transparent text-xs text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer text-right appearance-none"
                              >
                                <option value="">Unassigned</option>
                                {users.map(u => (
                                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="p-2 border-t border-zinc-800 mt-auto">
                <button 
                  onClick={() => handleCreateItem(category.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>
          ))}

          {/* Add Category Button */}
          <button 
            onClick={handleCreateCategory}
            className="flex-shrink-0 w-80 h-16 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Category
          </button>
        </div>
      </DragDropContext>
    </div>
  );
}
