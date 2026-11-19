import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, unauthorized } from "@/lib/auth-utils";
import { parsePlantBody, plantData } from "@/lib/plant-input";

async function refsError(userId: string, locationId: string, speciesId: string | null) {
  const location = await prisma.location.findFirst({
    where: { id: locationId, userId },
    select: { id: true },
  });
  if (!location) return "Emplacement introuvable";
  if (speciesId) {
    const species = await prisma.species.findUnique({
      where: { id: speciesId },
      select: { id: true },
    });
    if (!species) return "Espèce introuvable";
  }
  return null;
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = parsePlantBody(body as Record<string, unknown>);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const ref = await refsError(userId, parsed.data.locationId, parsed.data.speciesId);
  if (ref) return NextResponse.json({ error: ref }, { status: 400 });

  const plant = await prisma.plant.create({
    data: plantData(parsed.data, userId),
  });

  if (parsed.data.photoUrl) {
    await prisma.media.create({
      data: {
        url: parsed.data.photoUrl,
        kind: "plante",
        userId,
        plantId: plant.id,
      },
    });
  }

  return NextResponse.json({ id: plant.id }, { status: 201 });
}
