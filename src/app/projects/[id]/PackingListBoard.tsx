"use client";

import { useState } from "react";
import { Category, Item, PackingList, User } from "@prisma/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Edit2, Copy } from "lucide-react";
import { useTranslations } from "@/components/LocaleProvider";

type BoardUser = Pick<User, "id" | "name" | "email" | "image">;
type ItemWithAssignee = Item & { assignee: BoardUser | null };
type CategoryWithItems = Category & { items: ItemWithAssignee[] };
type ListWithCategories = PackingList & { categories: CategoryWithItems[] };
type ItemUpdates = Partial<
  Pick<ItemWithAssignee, "name" | "quantity" | "stagedCount" | "packedCount" | "categoryId" | "assigneeId">
> & {
  assignee?: BoardUser | null;
};

type PackingListBoardProps = {
  list: ListWithCategories;
  projectId: string;
  users: BoardUser[];
  onListUpdated: (updatedList: ListWithCategories) => void;
};

export function PackingListBoard({ list, projectId, users, onListUpdated }: PackingListBoardProps) {
  const messages = useTranslations();
  const [localList, setLocalList] = useState(list);

  const updateItemAPI = async (item: ItemWithAssignee, categoryId: string, updates: ItemUpdates) => {
    const updatedCategories = localList.categories.map((c) => {
      if (c.id === categoryId) {
        return {
          ...c,
          items: c.items.map((i) => i.id === item.id ? { ...i, ...updates } : i)
        };
      }
      return c;
    });
    setLocalList({ ...localList, categories: updatedCategories });
    onListUpdated({ ...localList, categories: updatedCategories });

    await fetch(`/api/projects/${projectId}/lists/${list.id}/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, ...updates }),
    });
  };

  const handleCreateCategory = async () => {
    const name = prompt(messages.packing.prompts.createCategory);
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
    const name = prompt(messages.packing.prompts.createItem);
    if (!name) return;

    const res = await fetch(`/api/projects/${projectId}/lists/${list.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryId }),
    });

    if (res.ok) {
      const newItem = await res.json();
      const updatedCategories = localList.categories.map((c) => {
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

  const handleToggleSingle = async (item: ItemWithAssignee, categoryId: string) => {
    let newStaged = item.stagedCount;
    let newPacked = item.packedCount;

    if (item.stagedCount === 0 && item.packedCount === 0) {
      newStaged = 1; newPacked = 0;
    } else if (item.stagedCount === 1) {
      newStaged = 0; newPacked = 1;
    } else {
      newStaged = 0; newPacked = 0;
    }

    updateItemAPI(item, categoryId, { stagedCount: newStaged, packedCount: newPacked });
  };

  const handleUpdateCount = async (item: ItemWithAssignee, categoryId: string, field: 'stagedCount'|'packedCount', delta: number) => {
    let newStaged = item.stagedCount;
    let newPacked = item.packedCount;

    if (field === 'stagedCount') newStaged = Math.max(0, newStaged + delta);
    if (field === 'packedCount') newPacked = Math.max(0, newPacked + delta);

    if (newStaged + newPacked > item.quantity) return; // Prevent exceeding quantity

    updateItemAPI(item, categoryId, { stagedCount: newStaged, packedCount: newPacked });
  };

  const handleAssigneeChange = async (item: ItemWithAssignee, categoryId: string, assigneeId: string | null) => {
    const assigneeObj = assigneeId ? users.find((u) => u.id === assigneeId) ?? null : null;
    updateItemAPI(item, categoryId, { assigneeId: assigneeId || null, assignee: assigneeObj });
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Deep copy categories
    const newCategories: CategoryWithItems[] = JSON.parse(JSON.stringify(localList.categories));
    
    const sourceCatIndex = newCategories.findIndex((c) => c.id === source.droppableId);
    const destCatIndex = newCategories.findIndex((c) => c.id === destination.droppableId);
    
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

  const getStatusDisplay = (item: ItemWithAssignee) => {
    if (item.packedCount === item.quantity) return { icon: "X", colors: "text-green-500 border-green-500/50 bg-green-500/10" };
    if (item.stagedCount > 0 || item.packedCount > 0) return { icon: "-", colors: "text-yellow-500 border-yellow-500/50 bg-yellow-500/10" };
    return { icon: "O", colors: "text-zinc-500 border-zinc-600" };
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden hide-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex items-start gap-4 h-full pb-4">
          {localList.categories.map((category) => {
            const totalQty = category.items.reduce((sum, i) => sum + i.quantity, 0);
            const totalStaged = category.items.reduce((sum, i) => sum + i.stagedCount, 0);
            const totalPacked = category.items.reduce((sum, i) => sum + i.packedCount, 0);

            return (
              <div key={category.id} className="flex-shrink-0 w-80 max-h-full flex flex-col bg-white/20 backdrop-blur-md shadow-xl rounded-2xl border border-white/40">
                <div className="p-3 border-b border-white/40 flex flex-col gap-1 sticky top-0 bg-white/30 backdrop-blur-xl rounded-t-2xl z-10">
                  <div className="flex items-center justify-between group/cat">
                    <h3 className="font-extrabold text-primary-950 drop-shadow-sm">{category.name}</h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                      <button 
                        onClick={async () => {
                          const newName = prompt(messages.packing.prompts.renameCategory, category.name);
                          if (!newName || newName === category.name) return;
                          
                          const newCategories = localList.categories.map((c) => c.id === category.id ? { ...c, name: newName } : c);
                          setLocalList({ ...localList, categories: newCategories });
                          onListUpdated({ ...localList, categories: newCategories });
                          
                          await fetch(`/api/projects/${projectId}/lists/${list.id}/categories`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ categoryId: category.id, name: newName }),
                          });
                        }}
                        className="text-primary-800 hover:text-primary-950 p-1"
                        title={messages.packing.renameCategoryTitle}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          const newName = prompt(messages.packing.prompts.duplicateCategory, `${category.name}${messages.project.prompts.duplicateSuffix}`);
                          if (!newName) return;
                          
                          const res = await fetch(`/api/projects/${projectId}/lists/${list.id}/categories/${category.id}/duplicate`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: newName }),
                          });

                          if (res.ok) {
                            const newCategory = await res.json();
                            const newCategories = [...localList.categories, newCategory];
                            setLocalList({ ...localList, categories: newCategories });
                            onListUpdated({ ...localList, categories: newCategories });
                          }
                        }}
                        className="text-primary-800 hover:text-primary-950 p-1"
                        title={messages.packing.duplicateCategoryTitle}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary-900/70 uppercase tracking-wider">
                    <span>{messages.packing.total}: {totalQty}</span>
                    <span>•</span>
                    <span className="text-analogous2-600 drop-shadow-sm">{messages.packing.staged}: {totalStaged}</span>
                    <span>•</span>
                    <span className="text-green-700 drop-shadow-sm">{messages.packing.packed}: {totalPacked}</span>
                  </div>
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
                      {category.items.map((item, index) => {
                        const status = getStatusDisplay(item);
                        return (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group flex flex-col gap-2 p-3 mb-2 rounded-xl border transition-all ${
                                  snapshot.isDragging 
                                    ? "bg-white border-primary-500/50 shadow-2xl rotate-2 scale-105 z-50" 
                                    : "bg-white/70 backdrop-blur-sm border-white/50 hover:border-white/80 shadow-sm"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  
                                  {item.quantity === 1 ? (
                                    <button 
                                      onClick={() => handleToggleSingle(item, category.id)}
                                      className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center border font-mono text-xs font-bold transition-colors ${status.colors}`}
                                    >
                                      {status.icon}
                                    </button>
                                  ) : (
                                    <div className={`shrink-0 px-1.5 py-0.5 rounded-md border text-[10px] font-bold font-mono transition-colors ${status.colors}`}>
                                      {item.packedCount}/{item.quantity}
                                    </div>
                                  )}

                                  <span className={`flex-1 text-sm font-bold ${item.packedCount === item.quantity ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                    {item.name}
                                  </span>

                                  <button 
                                    onClick={() => {
                                      const newName = prompt(messages.packing.prompts.renameItem, item.name);
                                      if (!newName || newName === item.name) return;

                                      const qtyStr = prompt(messages.packing.prompts.quantity, item.quantity.toString());
                                      const newQty = qtyStr ? parseInt(qtyStr, 10) : item.quantity;
                                      if (isNaN(newQty) || newQty < 1) return;

                                      let newStaged = item.stagedCount;
                                      let newPacked = item.packedCount;
                                      if (newStaged + newPacked > newQty) {
                                        newStaged = 0; newPacked = 0;
                                      }
                                      
                                      updateItemAPI(item, category.id, { name: newName, quantity: newQty, stagedCount: newStaged, packedCount: newPacked });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-800 transition-opacity"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Multi-Item Counter Panel */}
                                {item.quantity > 1 && (
                                  <div className="flex items-center gap-2 mt-1 text-xs bg-white/50 border border-white/60 p-2 rounded-lg shadow-inner">
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className="text-analogous2-600 font-bold uppercase tracking-wide text-[10px]">{messages.packing.staged}</span>
                                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                                        <button onClick={() => handleUpdateCount(item, category.id, 'stagedCount', -1)} className="w-5 h-5 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm">-</button>
                                        <span className="w-3 text-center">{item.stagedCount}</span>
                                        <button onClick={() => handleUpdateCount(item, category.id, 'stagedCount', 1)} className="w-5 h-5 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm">+</button>
                                      </div>
                                    </div>
                                    <div className="w-px h-6 bg-gray-300"></div>
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className="text-green-600 font-bold uppercase tracking-wide text-[10px]">{messages.packing.packed}</span>
                                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                                        <button onClick={() => handleUpdateCount(item, category.id, 'packedCount', -1)} className="w-5 h-5 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm">-</button>
                                        <span className="w-3 text-center">{item.packedCount}</span>
                                        <button onClick={() => handleUpdateCount(item, category.id, 'packedCount', 1)} className="w-5 h-5 flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-sm">+</button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Assignee Footer */}
                                <div className="flex justify-end mt-1">
                                  <select 
                                    value={item.assigneeId || ""}
                                    onChange={(e) => handleAssigneeChange(item, category.id, e.target.value)}
                                    className="bg-transparent text-xs text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer text-right appearance-none"
                                  >
                                    <option value="">{messages.common.unassigned}</option>
                                    {users.map(u => (
                                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className="p-2 border-t border-white/40 mt-auto">
                  <button 
                    onClick={() => handleCreateItem(category.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-primary-950 bg-white/20 hover:bg-white/40 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> {messages.packing.addItem}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Category Button */}
          <button 
            onClick={handleCreateCategory}
            className="flex-shrink-0 w-80 h-16 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/50 text-primary-950 font-bold bg-white/10 hover:bg-white/30 backdrop-blur-md shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" /> {messages.packing.addCategory}
          </button>
        </div>
      </DragDropContext>
    </div>
  );
}
