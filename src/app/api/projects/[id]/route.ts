import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Verify ownership or admin
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (project.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECTS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
