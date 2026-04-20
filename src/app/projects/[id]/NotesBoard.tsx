"use client";

import { useState } from "react";
import { Plus, Link as LinkIcon, MapPin, AlignLeft, Loader2 } from "lucide-react";

export function NotesBoard({ initialNotes, projectId }: { initialNotes: any[], projectId: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [type, setType] = useState("TEXT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const res = await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, type }),
    });

    if (res.ok) {
      const newNote = await res.json();
      setNotes([newNote, ...notes]);
      setContent("");
    }
    setIsSubmitting(false);
  };

  const getIcon = (t: string) => {
    if (t === "URL") return <LinkIcon className="w-5 h-5 text-indigo-400" />;
    if (t === "LOCATION") return <MapPin className="w-5 h-5 text-red-400" />;
    return <AlignLeft className="w-5 h-5 text-zinc-400" />;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full">
      {/* Create Note Form */}
      <div className="w-full md:w-1/3 flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <h3 className="font-semibold text-lg mb-4">Add a Note</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            {["TEXT", "URL", "LOCATION"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === t ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === "URL" ? "https://..." : 
              type === "LOCATION" ? "Coordinates or Place Name..." : 
              "Write your notes here..."
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none h-32"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Note
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div className="w-full md:w-2/3 flex flex-col gap-3 overflow-y-auto hide-scrollbar">
        {notes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <AlignLeft className="w-12 h-12 mb-4 opacity-50" />
            <p>No notes yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex items-start gap-4 p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/30">
              <div className="mt-1 p-2 bg-indigo-950/50 rounded-lg border border-indigo-900/50">
                {getIcon(note.type)}
              </div>
              <div className="flex-1">
                {note.type === "URL" ? (
                  <a href={note.content} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline break-all">
                    {note.content}
                  </a>
                ) : note.type === "LOCATION" ? (
                  <div className="text-zinc-200 font-medium flex items-center gap-2">
                    {note.content}
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(note.content)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      (Open in Maps)
                    </a>
                  </div>
                ) : (
                  <p className="text-zinc-300 whitespace-pre-wrap">{note.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
