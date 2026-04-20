import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProjectClient } from "./ProjectClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.status !== "APPROVED") {
    redirect("/login");
  }

  // Fetch project and verify access
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: true,
      lists: {
        include: {
          categories: {
            include: {
              items: {
                include: { assignee: true }
              }
            }
          }
        }
      },
      notes: true,
    }
  });

  if (!project) {
    redirect("/");
  }

  const hasAccess = 
    !project.isPrivate || 
    project.ownerId === session.user.id || 
    project.members.some(m => m.userId === session.user.id) ||
    session.user.role === "ADMIN";

  if (!hasAccess) {
    redirect("/");
  }

  // Fetch all users for assignment dropdowns
  const users = await prisma.user.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true, image: true, email: true }
  });

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col h-screen overflow-hidden">
      <ProjectClient initialProject={project} users={users} currentUser={session.user} />
    </main>
  );
}
