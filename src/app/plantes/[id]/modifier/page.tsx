import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/view-user";
import { plantInclude } from "@/lib/plant-input";
import { toFormValues } from "@/lib/plant-view";
import { PlantForm } from "@/components/plant-form";
import { ErrorState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

async function loadEdit(id: string, userId: string) {
  try {
    const [plant, species, locations] = await Promise.all([
      prisma.plant.findFirst({
        where: { id, userId },
        include: plantInclude,
      }),
      prisma.species.findMany({ orderBy: { commonName: "asc" } }),
      prisma.location.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
    return { plant, species, locations };
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return "db" as const;
  }
}

export default async function EditPlantPage({ params }: { params: Params }) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const data = await loadEdit(id, userId);
  if (data === "db") {
    return (
      <ErrorState
        title="Base inaccessible"
        description="Renseigne DATABASE_URL (Neon) dans .env, puis npm run db:push et npm run db:seed."
      />
    );
  }
  if (!data.plant) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Modifier</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.plant.nickname}</p>
      </div>
      <PlantForm
        mode="edit"
        plantId={data.plant.id}
        species={data.species}
        locations={data.locations}
        initial={toFormValues(data.plant)}
      />
    </div>
  );
}
