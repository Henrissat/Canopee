import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, requireUserId, unauthorized } from "@/lib/auth-utils";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await context.params;

  const plant = await prisma.plant.findFirst({ where: { id, userId } });
  if (!plant) return notFound();
  if (plant.status === "ARCHIVED") {
    return NextResponse.json(
      { error: "Cette plante est archivée. Réactive-la pour noter un soin." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const kind = body && typeof body === "object" ? String((body as { kind?: string }).kind ?? "") : "";
  if (kind !== "ARROSAGE" && kind !== "FERTILISATION") {
    return NextResponse.json({ error: "Soin invalide" }, { status: 400 });
  }
  if (kind === "FERTILISATION" && !plant.trackFertilizer) {
    return NextResponse.json({ error: "L'engrais n'est pas suivi pour cette plante" }, { status: 400 });
  }

  const performedAt = new Date();
  await prisma.$transaction([
    prisma.careEvent.create({
      data: {
        userId,
        plantId: id,
        kind,
        performedAt,
        method: kind === "ARROSAGE" ? plant.wateringMethod : null,
      },
    }),
    prisma.plant.update({
      where: { id },
      data:
        kind === "ARROSAGE"
          ? { lastWateredAt: performedAt }
          : { lastFertilizedAt: performedAt },
    }),
  ]);

  return NextResponse.json({ ok: true, performedAt });
}
