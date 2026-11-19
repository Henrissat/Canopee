import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Serre affichée en lecture :
 * - connecté → la sienne
 * - anonyme → serre publique (AUTH_ADMIN_EMAIL), s'il y en a une
 */
export async function getViewUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  return getPublicUserId();
}

export async function getPublicUserId(): Promise<string | null> {
  const email = (process.env.AUTH_ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
