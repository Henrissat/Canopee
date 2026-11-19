import Link from "next/link";
import { Leaf } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { WaterButton } from "@/components/care-buttons";
import type { PlantCardModel } from "@/lib/plant-view";

export function PlantCard({
  plant,
  canWrite,
  layout = "grid",
}: {
  plant: PlantCardModel;
  canWrite: boolean;
  layout?: "grid" | "row";
}) {
  const photo = plant.photoUrl ? (
    // URL libre (Cloudinary ou lien collé) : pas de liste d'hôtes figée.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={plant.photoUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-primary/8 text-primary/50">
      <Leaf className="h-8 w-8" />
    </span>
  );

  if (layout === "row") {
    return (
      <article className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <Link
          href={`/plantes/${plant.id}`}
          className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"
        >
          {photo}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/plantes/${plant.id}`} className="block truncate font-medium hover:text-primary">
            {plant.nickname}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {plant.speciesLabel} · {plant.locationName}
          </p>
          <div className="mt-1.5">
            <StatusBadge tone={plant.waterTone} label={plant.waterLabel} />
          </div>
        </div>
        {canWrite && plant.attention && <WaterButton plantId={plant.id} compact />}
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Link href={`/plantes/${plant.id}`} className="aspect-[4/3] overflow-hidden">
        {photo}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/plantes/${plant.id}`} className="block truncate font-display text-lg leading-tight hover:text-primary">
              {plant.nickname}
            </Link>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {plant.speciesLabel} · {plant.locationName}
            </p>
          </div>
          <StatusBadge tone={plant.waterTone} label={plant.waterLabel} />
        </div>
        <p className="text-sm leading-snug text-muted-foreground">{plant.waterDetail}</p>
        {canWrite && (
          <div className="mt-auto pt-2">
            <WaterButton plantId={plant.id} compact />
          </div>
        )}
      </div>
    </article>
  );
}
