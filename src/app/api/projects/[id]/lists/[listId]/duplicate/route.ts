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
    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Missing name", { status: 400 });
    }

    // Fetch the original list with all its categories and items
    const originalList = await prisma.packingList.findUnique({
      where: { id: listId },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    });

    if (!originalList) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Duplicate list deeply, resetting the counts
    const newList = await prisma.packingList.create({
      data: {
        projectId: id,
        name: name,
        categories: {
          create: originalList.categories.map(cat => ({
            name: cat.name,
            items: {
              create: cat.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                stagedCount: 0,
                packedCount: 0,
              }))
            }
          }))
        }
      },
      include: {
        categories: {
          include: {
            items: {
              include: {
                assignee: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(newList);
  } catch (error) {
    console.error("LIST_DUPLICATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
