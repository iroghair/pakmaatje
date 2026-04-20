import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, isPrivate } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        isPrivate: !!isPrivate,
        ownerId: session.user.id,
      },
    });

    // Also add the owner as a member
    await prisma.projectMember.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
