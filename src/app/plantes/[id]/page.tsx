import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import { Leaf } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUserId, getViewUserId } from "@/lib/view-user";
import { plantInclude } from "@/lib/plant-input";
import { formatDay } from "@/lib/dates";
import { waterDetail, waterLabel, waterStatus } from "@/lib/care-status";
import {
  fertilizerSummary,
  placeSummary,
  speciesLabel,
} from "@/lib/plant-view";
import { CARE_KIND_LABELS, PLANT_KIND_LABELS, SEASON_LABELS } from "@/lib/labels";
import { currentSeason } from "@/lib/care-status";
import { StatusBadge } from "@/components/status-badge";
import { ArchiveButton, FertilizeButton, WaterButton } from "@/components/care-buttons";
import { ErrorState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

async function loadPlant(id: string, userId: string) {
  try {
    return await prisma.plant.findFirst({
      where: { id, userId },
      include: {
        ...plantInclude,
        cares: { orderBy: { performedAt: "desc" as const }, take: 8 },
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return "db" as const;
  }
}

export default async function PlantPage({ params }: { params: Params }) {
  const { id } = await params;
  const userId = await getViewUserId();
  const sessionUserId = await getSessionUserId();
  const canWrite = !!sessionUserId && sessionUserId === userId;

  if (!userId) notFound();

  const loaded = await loadPlant(id, userId);
  if (loaded === "db") {
    return (
      <ErrorState
        title="Base inaccessible"
        description="Renseigne DATABASE_URL (Neon) dans .env, puis npm run db:push et npm run db:seed."
      />
    );
  }
  if (!loaded) notFound();
  const plant = loaded;

  const status = waterStatus(plant);
    const feed = fertilizerSummary(plant);
    const season = currentSeason();
    const archived = plant.status === "ARCHIVED";

    return (
      <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-muted">
            {plant.media[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={plant.media[0].url}
                alt=""
                className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-primary/40 sm:aspect-[16/9]">
                <Leaf className="h-12 w-12" />
              </div>
            )}
          </div>

          <header className="space-y-3">
            {archived && (
              <p className="text-sm font-medium text-muted-foreground">Archivée</p>
            )}
            <h1 className="font-display text-4xl leading-tight">{plant.nickname}</h1>
            <p className="text-muted-foreground">
              {speciesLabel(plant)}
              {plant.species?.scientificName ? ` · ${plant.species.scientificName}` : ""} ·{" "}
              {PLANT_KIND_LABELS[plant.kind]}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={status.tone} label={waterLabel(status)} />
              <StatusBadge tone={feed.tone} label={feed.label} />
            </div>
          </header>

          {canWrite && !archived && (
            <div className="flex flex-wrap items-center gap-3">
              <WaterButton plantId={plant.id} />
              {plant.trackFertilizer && feed.tone !== "pause" && (
                <FertilizeButton plantId={plant.id} />
              )}
              <Link href={`/plantes/${plant.id}/modifier`} className="text-sm text-primary">
                Modifier
              </Link>
              <ArchiveButton plantId={plant.id} archived={false} />
            </div>
          )}
          {canWrite && archived && (
            <div className="flex items-center gap-4">
              <Link href={`/plantes/${plant.id}/modifier`} className="text-sm text-primary">
                Modifier
              </Link>
              <ArchiveButton plantId={plant.id} archived />
            </div>
          )}

          <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h2 className="font-display text-xl">
              {SEASON_LABELS[season]}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{waterDetail(plant)}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Dernier arrosage : {formatDay(plant.lastWateredAt)}. Dernier engrais :{" "}
              {formatDay(plant.lastFertilizedAt)}.
            </p>
          </section>

          {plant.species && (
            <section className="space-y-3">
              <h2 className="font-display text-xl">Fiche {plant.species.commonName}</h2>
              <p className="text-sm leading-relaxed">{plant.species.summary}</p>
              {plant.species.tips && (
                <p className="text-sm leading-relaxed text-muted-foreground">{plant.species.tips}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Repères de départ, pas un diagnostic. Le pot, le chauffage et la lumière de ta pièce priment.
              </p>
            </section>
          )}

          {plant.species && plant.species.symptoms.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl">Si quelque chose cloche</h2>
              <ul className="space-y-3">
                {plant.species.symptoms.map((tip) => (
                  <li key={tip.id} className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="font-medium">{tip.symptom}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {tip.likelyCauses}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">{tip.whatToDo}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plant.notes && (
            <section>
              <h2 className="font-display text-xl">Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{plant.notes}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Emplacement
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {placeSummary(plant).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {plant.location.notes && (
              <p className="mt-3 text-sm text-muted-foreground">{plant.location.notes}</p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Derniers soins
            </h2>
            {plant.cares.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Aucun soin noté.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {plant.cares.map((care) => (
                  <li key={care.id} className="flex justify-between gap-3">
                    <span>{CARE_KIND_LABELS[care.kind]}</span>
                    <span className="text-muted-foreground">{formatDay(care.performedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </article>
    );
}
