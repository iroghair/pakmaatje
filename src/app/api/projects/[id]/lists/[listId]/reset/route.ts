import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, listId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, listId } = await params;

    // Find all categories in this list
    const categories = await prisma.category.findMany({
      where: { listId },
      select: { id: true }
    });

    const categoryIds = categories.map(c => c.id);

    if (categoryIds.length > 0) {
      await prisma.item.updateMany({
        where: { categoryId: { in: categoryIds } },
        data: {
          stagedCount: 0,
          packedCount: 0
        }
      });
    }

    return new NextResponse("Reset OK", { status: 200 });
  } catch (error) {
    console.error("LIST_RESET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
