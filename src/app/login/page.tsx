"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Backpack } from "lucide-react";
import { useTranslations } from "@/components/LocaleProvider";

export default function LoginPage() {
  const messages = useTranslations();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result?.ok) {
      setError(messages.login.invalidCredentials);
      return;
    }

    window.location.href = result.url || "/";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || messages.login.registerErrorDefault);
        setIsSubmitting(false);
        return;
      }

      setSuccess(messages.login.registerSuccess);

      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      setIsSubmitting(false);

      if (!signInResult?.ok) {
        return;
      }

      window.location.href = signInResult.url || "/";
    } catch {
      setError(messages.login.registerErrorDefault);
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-primary-950 drop-shadow-sm">{messages.appName}</h1>
          <p className="text-primary-900/80 font-medium">{messages.login.tagline}</p>
        </div>

        <div className="mb-5 flex bg-white/35 border border-white/60 rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${mode === "signin" ? "bg-white text-primary-950" : "text-primary-900/70 hover:text-primary-950"}`}
          >
            {messages.login.signInTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${mode === "register" ? "bg-white text-primary-950" : "text-primary-900/70 hover:text-primary-950"}`}
          >
            {messages.login.registerTab}
          </button>
        </div>

        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-primary-950 mb-1">{messages.login.emailLabel}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={messages.login.emailPlaceholder}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-primary-950 mb-1">{messages.login.passwordLabel}</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={messages.login.passwordPlaceholder}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold py-3 px-4 rounded-xl"
            >
              {isSubmitting ? messages.login.signingInButton : messages.login.signInButton}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-primary-950 mb-1">{messages.login.nameLabel}</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={messages.login.namePlaceholder}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-bold text-primary-950 mb-1">{messages.login.emailLabel}</label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={messages.login.emailPlaceholder}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-bold text-primary-950 mb-1">{messages.login.passwordLabel}</label>
              <input
                id="register-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={messages.login.passwordPlaceholder}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold py-3 px-4 rounded-xl"
            >
              {isSubmitting ? messages.login.registeringButton : messages.login.registerButton}
            </button>
          </form>
        )}

        {(error || success) && (
          <p className={`mt-4 text-center text-sm font-medium ${error ? "text-analogous1-700" : "text-green-700"}`}>
            {error || success}
          </p>
        )}

        <p className="mt-8 text-center text-xs font-bold text-primary-900/60 uppercase tracking-wide">
          {messages.login.approvalNotice}
        </p>
      </div>
    </main>
  );
}
