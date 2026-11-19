import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/view-user";
import { PlantForm, type PlantFormValues } from "@/components/plant-form";
import { ErrorState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

const BLANK: PlantFormValues = {
  nickname: "",
  speciesId: "",
  customSpeciesName: "",
  kind: "FEUILLAGE",
  acquiredAt: "",
  locationId: "",
  light: "",
  nearWindow: false,
  nearHeater: false,
  potDiameterCm: "",
  wateringMethod: "SUBSTRAT",
  waterDaysWinter: "",
  waterDaysSpring: "",
  waterDaysSummer: "",
  waterDaysAutumn: "",
  trackFertilizer: false,
  fertilizeEveryDays: "",
  fertilizePauseWinter: true,
  lastWateredAt: "",
  lastFertilizedAt: "",
  notes: "",
  photoUrl: "",
};

async function loadForm(userId: string) {
  try {
    const [species, locations] = await Promise.all([
      prisma.species.findMany({ orderBy: { commonName: "asc" } }),
      prisma.location.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
    return { species, locations };
  } catch (error) {
    console.error(error);
    return "db" as const;
  }
}

export default async function NewPlantPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const data = await loadForm(userId);
  if (data === "db") {
    return (
      <ErrorState
        title="Base inaccessible"
        description="Renseigne DATABASE_URL (Neon) dans .env, puis npm run db:push et npm run db:seed."
      />
    );
  }

  const { species, locations } = data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Nouvelle plante</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Le nom est le tien. L&apos;espèce sert de repère d&apos;arrosage, pas d&apos;étiquette figée.
        </p>
      </div>
      {locations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
          Il faut un emplacement avant une plante.{" "}
          <Link href="/emplacements" className="text-primary">
            Créer un lieu
          </Link>
        </p>
      ) : (
        <PlantForm
          mode="create"
          species={species}
          locations={locations}
          initial={{ ...BLANK, locationId: locations[0]?.id ?? "" }}
        />
      )}
    </div>
  );
}
