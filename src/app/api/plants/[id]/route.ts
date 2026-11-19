import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, requireUserId, unauthorized } from "@/lib/auth-utils";
import { parsePlantBody } from "@/lib/plant-input";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await context.params;

  const existing = await prisma.plant.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const record = body as Record<string, unknown>;

  if (record.action === "archive" || record.action === "restore") {
    const plant = await prisma.plant.update({
      where: { id },
      data: { status: record.action === "archive" ? "ARCHIVED" : "ACTIVE" },
    });
    return NextResponse.json({ id: plant.id, status: plant.status });
  }

  const parsed = parsePlantBody(record);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: parsed.data.locationId, userId },
    select: { id: true },
  });
  if (!location) {
    return NextResponse.json({ error: "Emplacement introuvable" }, { status: 400 });
  }
  if (parsed.data.speciesId) {
    const species = await prisma.species.findUnique({
      where: { id: parsed.data.speciesId },
      select: { id: true },
    });
    if (!species) {
      return NextResponse.json({ error: "Espèce introuvable" }, { status: 400 });
    }
  }

  const input = parsed.data;
  await prisma.plant.update({
    where: { id },
    data: {
      nickname: input.nickname,
      customSpeciesName: input.customSpeciesName,
      kind: input.kind,
      acquiredAt: input.acquiredAt,
      light: input.light,
      nearWindow: input.nearWindow,
      nearHeater: input.nearHeater,
      potDiameterCm: input.potDiameterCm,
      wateringMethod: input.wateringMethod,
      waterDaysWinter: input.waterDaysWinter,
      waterDaysSpring: input.waterDaysSpring,
      waterDaysSummer: input.waterDaysSummer,
      waterDaysAutumn: input.waterDaysAutumn,
      trackFertilizer: input.trackFertilizer,
      fertilizeEveryDays: input.fertilizeEveryDays,
      fertilizePauseWinter: input.fertilizePauseWinter,
      lastWateredAt: input.lastWateredAt,
      lastFertilizedAt: input.lastFertilizedAt,
      notes: input.notes,
      location: { connect: { id: input.locationId } },
      species: input.speciesId
        ? { connect: { id: input.speciesId } }
        : existing.speciesId
          ? { disconnect: true }
          : undefined,
    },
  });

  if (!input.photoUrl) {
    await prisma.media.deleteMany({ where: { plantId: id, userId } });
  } else {
    const latest = await prisma.media.findFirst({
      where: { plantId: id, userId },
      orderBy: { createdAt: "desc" },
    });
    if (latest?.url !== input.photoUrl) {
      await prisma.media.create({
        data: { url: input.photoUrl, kind: "plante", userId, plantId: id },
      });
    }
  }

  return NextResponse.json({ id });
}
