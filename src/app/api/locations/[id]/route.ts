import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound, requireUserId, unauthorized } from "@/lib/auth-utils";
import { parseLocationBody } from "@/lib/location-input";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await context.params;

  const existing = await prisma.location.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const parsed = parseLocationBody(body as Record<string, unknown>);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const location = await prisma.location.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(location);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Tu as déjà un lieu avec ce nom" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await context.params;

  const existing = await prisma.location.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  const plants = await prisma.plant.count({ where: { locationId: id, userId } });
  if (plants > 0) {
    return NextResponse.json(
      { error: "Déplace d'abord les plantes de ce lieu, y compris les archivées." },
      { status: 409 },
    );
  }

  await prisma.location.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
