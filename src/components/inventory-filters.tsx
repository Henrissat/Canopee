"use client";

import { useRouter } from "next/navigation";
import { PLANT_KIND_LABELS, PLANT_KINDS } from "@/lib/labels";
import { fieldClass } from "@/lib/form";
import { cn } from "@/lib/utils";

type LocationOption = { id: string; name: string };

const CARE_FILTERS = [
  { id: "", label: "Toutes" },
  { id: "arroser", label: "À arroser" },
  { id: "retard", label: "En retard" },
  { id: "ok", label: "Au rythme" },
] as const;

export function InventoryFilters({
  locations,
  initial,
}: {
  locations: LocationOption[];
  initial: {
    q: string;
    type: string;
    lieu: string;
    soin: string;
    archive: boolean;
    tri: string;
  };
}) {
  const router = useRouter();

  function push(next: Partial<typeof initial>) {
    const value = { ...initial, ...next };
    const params = new URLSearchParams();
    if (value.q) params.set("q", value.q);
    if (value.type) params.set("type", value.type);
    if (value.lieu) params.set("lieu", value.lieu);
    if (value.soin) params.set("soin", value.soin);
    if (value.archive) params.set("archive", "1");
    if (value.tri && value.tri !== "urgence") params.set("tri", value.tri);
    const query = params.toString();
    router.replace(query ? `/plantes?${query}` : "/plantes");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CARE_FILTERS.map((filter) => {
          const active = initial.soin === filter.id;
          return (
            <button
              key={filter.id || "toutes"}
              type="button"
              onClick={() => push({ soin: filter.id })}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <input
          type="search"
          defaultValue={initial.q}
          placeholder="Nom ou espèce"
          aria-label="Rechercher"
          className={fieldClass}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              push({ q: event.currentTarget.value.trim() });
            }
          }}
          onBlur={(event) => {
            const q = event.target.value.trim();
            if (q !== initial.q) push({ q });
          }}
        />
        <select
          aria-label="Type"
          className={fieldClass}
          value={initial.type}
          onChange={(event) => push({ type: event.target.value })}
        >
          <option value="">Tous les types</option>
          {PLANT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {PLANT_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
        <select
          aria-label="Emplacement"
          className={fieldClass}
          value={initial.lieu}
          onChange={(event) => push({ lieu: event.target.value })}
        >
          <option value="">Tous les lieux</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Tri"
          className={fieldClass}
          value={initial.tri}
          onChange={(event) => push({ tri: event.target.value })}
        >
          <option value="urgence">Plus urgentes</option>
          <option value="recent">Ajout récent</option>
          <option value="nom">Nom</option>
        </select>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={initial.archive}
          onChange={(event) => push({ archive: event.target.checked })}
        />
        Voir les archivées
      </label>
    </div>
  );
}
