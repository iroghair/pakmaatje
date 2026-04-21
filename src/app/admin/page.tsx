import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE_NAME, resolveLocale } from "@/lib/i18n";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const locale = resolveLocale((await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  const messages = getDictionary(locale);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" }
  });

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 rounded-full hover:bg-white/30 bg-white/10 backdrop-blur-md border border-white/30 transition text-primary-900 hover:text-primary-950">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-950 drop-shadow-sm">{messages.admin.title}</h1>
          <p className="text-sm text-primary-900/80 font-medium mt-1">{messages.admin.description}</p>
        </div>
      </header>

      <AdminClient initialUsers={users} />
    </main>
  );
}
