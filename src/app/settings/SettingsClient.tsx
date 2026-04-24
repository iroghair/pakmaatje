"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "@/components/LocaleProvider";
import type { AvatarOption } from "@/lib/avatar";

type SettingsClientProps = {
  initialName: string;
  initialImage: string;
  avatarOptions: AvatarOption[];
};

export function SettingsClient({ initialName, initialImage, avatarOptions }: SettingsClientProps) {
  const router = useRouter();
  const messages = useTranslations();
  const [name, setName] = useState(initialName);
  const [selectedImage, setSelectedImage] = useState(initialImage || avatarOptions[0]?.image || "");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: selectedImage }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || messages.settings.saveError);
        setIsSaving(false);
        return;
      }

      setFeedback(messages.settings.saved);
      router.refresh();
    } catch {
      setError(messages.settings.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12">
      <header className="mb-8 flex items-center gap-3">
        <Link href="/" className="p-2 rounded-full hover:bg-white/30 bg-white/10 backdrop-blur-md border border-white/30 transition text-primary-900 hover:text-primary-950">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-950 drop-shadow-sm">{messages.settings.title}</h1>
          <p className="text-sm text-primary-900/80 font-medium">{messages.settings.description}</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-white/20 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/50 shadow-md relative bg-white/20">
            {selectedImage ? (
              <Image src={selectedImage} alt={name || messages.common.user} fill className="object-cover" />
            ) : null}
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-950">{messages.settings.profilePreview}</h2>
            <p className="text-sm text-primary-900/70">{messages.settings.pickAvatar}</p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-bold text-primary-950 mb-1">{messages.settings.nameLabel}</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={messages.settings.namePlaceholder}
            required
            className="w-full max-w-lg bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
          />
        </div>

        <div>
          <h3 className="text-sm font-bold text-primary-950 mb-3">{messages.settings.avatarLabel}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {avatarOptions.map((option) => {
              const selected = selectedImage === option.image;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedImage(option.image)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition ${selected ? "border-primary-600 scale-105" : "border-white/50 hover:border-white"}`}
                  title={option.animal}
                >
                  <Image src={option.image} alt={option.animal} fill className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        {(feedback || error) && (
          <p className={`text-sm font-semibold ${error ? "text-red-700" : "text-green-700"}`}>{feedback || error}</p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? messages.settings.saving : messages.settings.save}
        </button>
      </form>
    </main>
  );
}
