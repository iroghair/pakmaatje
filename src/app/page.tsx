import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut, Plus, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.status === "PENDING") {
    redirect("/pending");
  }

  // Fetch projects
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { isPrivate: false },
        { members: { some: { userId: session.user.id } } },
        { ownerId: session.user.id },
      ],
    },
    include: {
      _count: {
        select: { lists: true, notes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12">
      <header className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <div className="flex items-center gap-4">
          <Link href="/api/auth/signout" className="text-zinc-400 hover:text-white transition">
            <LogOut className="w-5 h-5" />
          </Link>
          {session.user.role === "ADMIN" && (
            <Link href="/admin" className="text-zinc-400 hover:text-white transition">
              <Settings className="w-5 h-5" />
            </Link>
          )}
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden relative flex items-center justify-center">
            {session.user.image ? (
              <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
            ) : (
              <span className="text-sm font-medium">{session.user.email?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      <DashboardClient initialProjects={projects} userId={session.user.id} />
    </main>
  );
}
