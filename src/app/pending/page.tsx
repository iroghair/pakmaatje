import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE_NAME, resolveLocale } from "@/lib/i18n";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);
  const locale = resolveLocale((await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  const messages = getDictionary(locale);

  if (!session) {
    redirect("/login");
  }

  if (session.user.status === "APPROVED") {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/50 rounded-3xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center border border-white/60 shadow-inner">
            <Clock className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-extrabold tracking-tight mb-3 text-primary-950 drop-shadow-sm">{messages.pending.title}</h1>
        <p className="text-primary-900/80 mb-8 font-medium">
          {messages.pending.description}
        </p>

        <Link
          href="/api/auth/signout"
          className="text-sm font-bold text-primary-900/60 hover:text-primary-950 transition-colors uppercase tracking-wide"
        >
          {messages.pending.signOut}
        </Link>
      </div>
    </main>
  );
}
