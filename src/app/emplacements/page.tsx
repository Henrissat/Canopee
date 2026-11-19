import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/view-user";
import { LocationManager } from "@/components/location-manager";
import { ErrorState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

async function loadLocations(userId: string) {
  try {
    return await prisma.location.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { _count: { select: { plants: true } } },
    });
  } catch (error) {
    console.error(error);
    return "db" as const;
  }
}

export default async function LocationsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const locations = await loadLocations(userId);
  if (locations === "db") {
    return (
      <ErrorState
        title="Base inaccessible"
        description="Renseigne DATABASE_URL (Neon) dans .env, puis npm run db:push et npm run db:seed."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Emplacements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Le chauffage, la lumière et l&apos;orientation décrivent le lieu. Chaque plante dit seulement si elle est contre la vitre ou près du radiateur.
        </p>
      </div>
      <LocationManager
        locations={locations.map((location) => ({
          id: location.id,
          name: location.name,
          kind: location.kind,
          light: location.light,
          heating: location.heating,
          orientation: location.orientation,
          notes: location.notes,
          plantCount: location._count.plants,
        }))}
      />
    </div>
  );
}
