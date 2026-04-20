import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, type } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        content,
        type: type || "TEXT",
        projectId: id,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
