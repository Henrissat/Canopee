import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId, getViewUserId } from "@/lib/view-user";
import { plantInclude } from "@/lib/plant-input";
import { waterStatus } from "@/lib/care-status";
import { sortPlants, toPlantCard } from "@/lib/plant-view";
import { PlantCard } from "@/components/plant-card";
import { InventoryFilters } from "@/components/inventory-filters";
import { EmptyState, ErrorState } from "@/components/empty-state";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value ?? "").trim();
}

export default async function PlantsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = one(sp.q).toLowerCase();
  const type = one(sp.type);
  const lieu = one(sp.lieu);
  const soin = one(sp.soin);
  const tri = one(sp.tri) || "urgence";
  const archive = one(sp.archive) === "1";

  const userId = await getViewUserId();
  const canWrite = !!(await getSessionUserId());

  let dbError = false;
  let cards: ReturnType<typeof toPlantCard>[] = [];
  let locations: { id: string; name: string }[] = [];
  let total = 0;

  try {
    if (userId) {
      const [plants, locs] = await Promise.all([
        prisma.plant.findMany({
          where: { userId, status: archive ? "ARCHIVED" : "ACTIVE" },
          include: plantInclude,
        }),
        prisma.location.findMany({
          where: { userId },
          orderBy: { name: "asc" },
          select: { id: true, name: true, kind: true },
        }),
      ]);
      locations = locs;
      total = plants.length;

      const filtered = plants.filter((plant) => {
        if (type && plant.kind !== type) return false;
        if (lieu && plant.locationId !== lieu) return false;
        if (q) {
          const hay = [
            plant.nickname,
            plant.customSpeciesName,
            plant.species?.commonName,
            plant.species?.scientificName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        const status = waterStatus(plant);
        if (soin === "arroser" && status.tone !== "late" && status.tone !== "soon") return false;
        if (soin === "retard" && status.tone !== "late") return false;
        if (soin === "ok" && status.tone !== "ok") return false;
        return true;
      });

      cards = sortPlants(filtered, tri).map(toPlantCard);
    }
  } catch (error) {
    console.error(error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Plantes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {archive ? "Archivées" : "En culture"}
            {userId && !dbError ? ` · ${cards.length} affichée${cards.length > 1 ? "s" : ""} sur ${total}` : ""}
          </p>
        </div>
        {canWrite && (
          <Link
            href="/plantes/nouvelle"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Link>
        )}
      </div>

      {!canWrite && userId && (
        <p className="text-sm text-muted-foreground">Lecture seule — serre du compte admin.</p>
      )}

      {dbError ? (
        <ErrorState
          title="Base inaccessible"
          description="Renseigne DATABASE_URL (Neon) dans .env, puis npm run db:push et npm run db:seed."
        />
      ) : !userId ? (
        <EmptyState
          title="Pas de serre à afficher"
          description="Connecte-toi, ou définis AUTH_ADMIN_EMAIL pour une lecture publique."
          action={
            <Link href="/register" className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              Créer un compte
            </Link>
          }
        />
      ) : (
        <>
          <InventoryFilters
            locations={locations}
            initial={{ q: one(sp.q), type, lieu, soin, archive, tri }}
          />
          {cards.length === 0 ? (
            <EmptyState
              title={total === 0 ? "Aucune plante" : "Aucun résultat"}
              description={
                total === 0
                  ? "Ajoute une plante, avec son lieu et son rythme par saison."
                  : "Élargis les filtres, ou change de pièce."
              }
              action={
                canWrite && total === 0 ? (
                  <Link href="/plantes/nouvelle" className="text-sm font-medium text-primary">
                    Ajouter une plante
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((plant) => (
                <PlantCard key={plant.id} plant={plant} canWrite={canWrite && !archive} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
