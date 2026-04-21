"use client";

import { signIn } from "next-auth/react";
import { Backpack } from "lucide-react";
import { useTranslations } from "@/components/LocaleProvider";

export default function LoginPage() {
  const messages = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-transparent">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-500/20 blur-[120px]" />

      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/50 rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-analogous1-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Backpack className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-primary-950 drop-shadow-sm">Packmate</h1>
          <p className="text-primary-900/80 font-medium">{messages.login.tagline}</p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-white text-black hover:bg-gray-100 transition-colors font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-gray-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {messages.login.continueWithGoogle}
        </button>

        <p className="mt-8 text-center text-xs font-bold text-primary-900/60 uppercase tracking-wide">
          {messages.login.approvalNotice}
        </p>
      </div>
    </main>
  );
}
