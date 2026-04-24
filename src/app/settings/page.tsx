import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDefaultAvatar, getAvatarOptions } from "@/lib/avatar";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const seed = user.email || user.id;
  const fallbackImage = generateDefaultAvatar(seed);

  return (
    <SettingsClient
      initialName={user.name || ""}
      initialImage={user.image || fallbackImage}
      avatarOptions={getAvatarOptions(seed, 24)}
    />
  );
}
