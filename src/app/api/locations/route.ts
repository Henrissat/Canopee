import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId, unauthorized } from "@/lib/auth-utils";
import { parseLocationBody } from "@/lib/location-input";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const locations = await prisma.location.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = parseLocationBody(body as Record<string, unknown>);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const location = await prisma.location.create({
      data: { ...parsed.data, userId },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Tu as déjà un lieu avec ce nom" }, { status: 409 });
    }
    throw error;
  }
}
