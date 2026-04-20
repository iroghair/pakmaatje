import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import Link from "next/link";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.status === "APPROVED") {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-3">Approval Pending</h1>
        <p className="text-zinc-400 mb-8">
          Your account has been created, but it requires administrator approval before you can access projects and packing lists.
        </p>

        <Link
          href="/api/auth/signout"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Sign out and try another account
        </Link>
      </div>
    </main>
  );
}
