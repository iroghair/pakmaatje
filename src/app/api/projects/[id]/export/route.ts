import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
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
      return new NextResponse("Not found", { status: 404 });
    }

    // Generate Markdown
    let md = `# Project: ${project.name}\n\n`;
    if (project.description) {
      md += `*${project.description}*\n\n`;
    }

    md += `---\n\n`;

    // Lists
    project.lists.forEach((list) => {
      md += `# List: ${list.name}\n\n`;
      list.categories.forEach((category) => {
        md += `## ${category.name}\n`;
        category.items.forEach((item) => {
          let checkbox = "[ ]";
          if (item.packStatus === "PACKED") checkbox = "[x]";
          else if (item.packStatus === "STAGED") checkbox = "[-]";

          let assigneeStr = item.assignee ? ` (@${item.assignee.name || item.assignee.email})` : "";
          md += `- ${checkbox} ${item.name}${assigneeStr}\n`;
        });
        md += "\n";
      });
      md += "---\n\n";
    });

    // Notes
    if (project.notes.length > 0) {
      md += `# Notes & Links\n\n`;
      project.notes.forEach((note) => {
        if (note.type === "URL") {
          md += `- 🔗 [${note.content}](${note.content})\n`;
        } else if (note.type === "LOCATION") {
          md += `- 📍 **Location:** ${note.content} ([Map](https://maps.google.com/?q=${encodeURIComponent(note.content)}))\n`;
        } else {
          md += `- 📝 ${note.content}\n`;
        }
      });
    }

    const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md`;

    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("[EXPORT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
