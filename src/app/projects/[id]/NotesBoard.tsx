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
    if (t === "URL") return <LinkIcon className="w-5 h-5 text-accent-600 drop-shadow-sm" />;
    if (t === "LOCATION") return <MapPin className="w-5 h-5 text-analogous1-600 drop-shadow-sm" />;
    return <AlignLeft className="w-5 h-5 text-primary-600 drop-shadow-sm" />;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full">
      {/* Create Note Form */}
      <div className="w-full md:w-1/3 flex flex-col bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-5">
        <h3 className="font-extrabold text-xl text-primary-950 mb-4 drop-shadow-sm">Add a Note</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-300 shadow-inner">
            {["TEXT", "URL", "LOCATION"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                  type === t ? "bg-white text-black border border-gray-200" : "text-gray-500 hover:text-black hover:bg-white/50 border border-transparent shadow-none"
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
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none h-32 shadow-inner"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add Note
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div className="w-full md:w-2/3 flex flex-col gap-3 overflow-y-auto hide-scrollbar pb-6">
        {notes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-primary-900/60 font-medium">
            <AlignLeft className="w-12 h-12 mb-4 opacity-50" />
            <p>No notes yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex items-start gap-4 p-5 bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 shadow-md transition-all hover:bg-white/40">
              <div className="mt-0.5 p-2.5 bg-white/60 rounded-xl shadow-sm border border-white/80">
                {getIcon(note.type)}
              </div>
              <div className="flex-1">
                {note.type === "URL" ? (
                  <a href={note.content} target="_blank" rel="noreferrer" className="text-accent-700 font-extrabold hover:text-accent-500 hover:underline break-all text-lg drop-shadow-sm">
                    {note.content}
                  </a>
                ) : note.type === "LOCATION" ? (
                  <div className="text-primary-950 font-bold flex items-center gap-3 text-lg drop-shadow-sm">
                    {note.content}
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(note.content)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold bg-white/50 px-2 py-1 rounded-md text-accent-700 hover:bg-white border border-white transition-colors shadow-sm"
                    >
                      Open in Maps
                    </a>
                  </div>
                ) : (
                  <p className="text-primary-950 font-medium whitespace-pre-wrap leading-relaxed text-base">{note.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
