"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { fieldClass, labelClass } from "@/lib/form";
import {
  HEATING_KINDS,
  HEATING_LABELS,
  LIGHT_LABELS,
  LIGHT_LEVELS,
  LOCATION_KIND_LABELS,
  LOCATION_KINDS,
  ORIENTATION_LABELS,
  ORIENTATIONS,
} from "@/lib/labels";

export type LocationRecord = {
  id: string;
  name: string;
  kind: keyof typeof LOCATION_KIND_LABELS;
  light: keyof typeof LIGHT_LABELS;
  heating: keyof typeof HEATING_LABELS;
  orientation: keyof typeof ORIENTATION_LABELS;
  notes: string | null;
  plantCount: number;
};

type LocationFormState = {
  name: string;
  kind: string;
  light: string;
  heating: string;
  orientation: string;
  notes: string;
};

const empty: LocationFormState = {
  name: "",
  kind: "INTERIEUR",
  light: "FAIBLE",
  heating: "ELECTRIQUE",
  orientation: "INCONNUE",
  notes: "",
};

export function LocationManager({ locations }: { locations: LocationRecord[] }) {
  return (
    <div className="space-y-8">
      <LocationForm />
      <ul className="space-y-3">
        {locations.map((location) => (
          <li key={location.id}>
            <LocationCard location={location} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LocationForm() {
  const router = useRouter();
  const [values, setValues] = useState<LocationFormState>(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Création impossible");
      setValues(empty);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 className="font-display text-xl">Nouvel emplacement</h2>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <LocationFields values={values} onChange={setValues} idPrefix="new" />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Ajouter le lieu
      </button>
    </form>
  );
}

function LocationCard({ location }: { location: LocationRecord }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<LocationFormState>({
    name: location.name,
    kind: location.kind,
    light: location.light,
    heating: location.heating,
    orientation: location.orientation,
    notes: location.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Enregistrement impossible");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Supprimer « ${location.name} » ?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/locations/${location.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Suppression impossible");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <article className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg">{location.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {LOCATION_KIND_LABELS[location.kind]} · lumière {LIGHT_LABELS[location.light].toLowerCase()} ·{" "}
              {HEATING_LABELS[location.heating].toLowerCase()}
              {location.orientation !== "INCONNUE"
                ? ` · ${ORIENTATION_LABELS[location.orientation].toLowerCase()}`
                : ""}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {location.plantCount} plante{location.plantCount > 1 ? "s" : ""}
            </p>
            {location.notes && <p className="mt-2 text-sm">{location.notes}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button type="button" onClick={() => setEditing(true)} className="text-sm text-primary">
              Modifier
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={loading || location.plantCount > 0}
              title={location.plantCount > 0 ? "Déplace d'abord les plantes" : "Supprimer"}
              className="text-sm text-muted-foreground disabled:opacity-40"
            >
              Supprimer
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </article>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <LocationFields values={values} onChange={setValues} idPrefix={location.id} />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          Enregistrer
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-sm text-muted-foreground">
          Annuler
        </button>
      </div>
    </form>
  );
}

function LocationFields({
  values,
  onChange,
  idPrefix,
}: {
  values: LocationFormState;
  onChange: (values: LocationFormState) => void;
  idPrefix: string;
}) {
  function set(key: keyof LocationFormState, value: string) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`${idPrefix}-name`}>
          Nom
        </label>
        <input
          id={`${idPrefix}-name`}
          required
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          placeholder="Salon, balcon, jardinière sud…"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-kind`}>
          Type
        </label>
        <select
          id={`${idPrefix}-kind`}
          value={values.kind}
          onChange={(event) => set("kind", event.target.value)}
          className={fieldClass}
        >
          {LOCATION_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {LOCATION_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-light`}>
          Lumière habituelle
        </label>
        <select
          id={`${idPrefix}-light`}
          value={values.light}
          onChange={(event) => set("light", event.target.value)}
          className={fieldClass}
        >
          {LIGHT_LEVELS.map((level) => (
            <option key={level} value={level}>
              {LIGHT_LABELS[level]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-heating`}>
          Chauffage
        </label>
        <select
          id={`${idPrefix}-heating`}
          value={values.heating}
          onChange={(event) => set("heating", event.target.value)}
          className={fieldClass}
        >
          {HEATING_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {HEATING_LABELS[kind]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-orientation`}>
          Orientation
        </label>
        <select
          id={`${idPrefix}-orientation`}
          value={values.orientation}
          onChange={(event) => set("orientation", event.target.value)}
          className={fieldClass}
        >
          {ORIENTATIONS.map((orientation) => (
            <option key={orientation} value={orientation}>
              {ORIENTATION_LABELS[orientation]}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`${idPrefix}-notes`}>
          Notes
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          rows={2}
          value={values.notes}
          onChange={(event) => set("notes", event.target.value)}
          className={fieldClass}
        />
      </div>
    </div>
  );
}
