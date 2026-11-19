"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { currentSeason } from "@/lib/care-status";
import { fieldClass, labelClass } from "@/lib/form";
import {
  LIGHT_LABELS,
  LIGHT_LEVELS,
  PLANT_KIND_LABELS,
  PLANT_KINDS,
  SEASON_LABELS,
  WATERING_METHOD_LABELS,
  WATERING_METHODS,
  type SeasonKey,
} from "@/lib/labels";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export type SpeciesOption = {
  id: string;
  commonName: string;
  scientificName: string | null;
  kind: string;
  waterDaysWinter: number;
  waterDaysSpring: number;
  waterDaysSummer: number;
  waterDaysAutumn: number;
  fertilizeEveryDays: number | null;
  defaultMethod: string;
};

export type LocationOption = { id: string; name: string };

export type PlantFormValues = {
  nickname: string;
  speciesId: string;
  customSpeciesName: string;
  kind: string;
  acquiredAt: string;
  locationId: string;
  light: string;
  nearWindow: boolean;
  nearHeater: boolean;
  potDiameterCm: string;
  wateringMethod: string;
  waterDaysWinter: string;
  waterDaysSpring: string;
  waterDaysSummer: string;
  waterDaysAutumn: string;
  trackFertilizer: boolean;
  fertilizeEveryDays: string;
  fertilizePauseWinter: boolean;
  lastWateredAt: string;
  lastFertilizedAt: string;
  notes: string;
  photoUrl: string;
};

const EMPTY: PlantFormValues = {
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

const SEASON_FIELDS: {
  key: SeasonKey;
  field: "waterDaysWinter" | "waterDaysSpring" | "waterDaysSummer" | "waterDaysAutumn";
}[] = [
  { key: "winter", field: "waterDaysWinter" },
  { key: "spring", field: "waterDaysSpring" },
  { key: "summer", field: "waterDaysSummer" },
  { key: "autumn", field: "waterDaysAutumn" },
];

export function PlantForm({
  mode,
  plantId,
  species,
  locations,
  initial,
}: {
  mode: "create" | "edit";
  plantId?: string;
  species: SpeciesOption[];
  locations: LocationOption[];
  initial?: PlantFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PlantFormValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const season = currentSeason();
  const cloudinary = isCloudinaryConfigured();

  function set<K extends keyof PlantFormValues>(key: K, value: PlantFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function applySpecies(id: string) {
    const picked = species.find((item) => item.id === id);
    setValues((current) => {
      if (!picked) {
        return { ...current, speciesId: "" };
      }
      return {
        ...current,
        speciesId: picked.id,
        customSpeciesName: "",
        kind: picked.kind,
        wateringMethod: picked.defaultMethod,
        waterDaysWinter: String(picked.waterDaysWinter),
        waterDaysSpring: String(picked.waterDaysSpring),
        waterDaysSummer: String(picked.waterDaysSummer),
        waterDaysAutumn: String(picked.waterDaysAutumn),
        trackFertilizer: picked.fertilizeEveryDays != null,
        fertilizeEveryDays:
          picked.fertilizeEveryDays != null ? String(picked.fertilizeEveryDays) : "",
        fertilizePauseWinter: true,
      };
    });
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImageToCloudinary(file);
      set("photoUrl", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(mode === "create" ? "/api/plants" : `/api/plants/${plantId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Enregistrement impossible");
      }
      router.push(`/plantes/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl">La plante</h2>
        <div>
          <label className={labelClass} htmlFor="nickname">
            Nom
          </label>
          <input
            id="nickname"
            required
            value={values.nickname}
            onChange={(event) => set("nickname", event.target.value)}
            placeholder="Monstera du salon"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="species">
              Espèce
            </label>
            <select
              id="species"
              value={values.speciesId}
              onChange={(event) => applySpecies(event.target.value)}
              className={fieldClass}
            >
              <option value="">Hors catalogue</option>
              {species.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.commonName}
                  {item.scientificName ? ` — ${item.scientificName}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="kind">
              Type
            </label>
            <select
              id="kind"
              value={values.kind}
              onChange={(event) => set("kind", event.target.value)}
              className={fieldClass}
            >
              {PLANT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {PLANT_KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!values.speciesId && (
          <div>
            <label className={labelClass} htmlFor="customSpecies">
              Espèce ou variété
            </label>
            <input
              id="customSpecies"
              required
              value={values.customSpeciesName}
              onChange={(event) => set("customSpeciesName", event.target.value)}
              placeholder="Monstera adansonii"
              className={fieldClass}
            />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="acquired">
              Date d&apos;acquisition
            </label>
            <input
              id="acquired"
              type="date"
              value={values.acquiredAt}
              onChange={(event) => set("acquiredAt", event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pot">
              Diamètre du pot (cm)
            </label>
            <input
              id="pot"
              inputMode="numeric"
              value={values.potDiameterCm}
              onChange={(event) => set("potDiameterCm", event.target.value)}
              placeholder="21"
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Où elle vit</h2>
        <p className="text-sm text-muted-foreground">
          Le chauffage et la lumière de la pièce sont sur l&apos;emplacement. Ici, seulement ce qui est propre à cette plante.
        </p>
        <div>
          <label className={labelClass} htmlFor="location">
            Emplacement
          </label>
          <select
            id="location"
            required
            value={values.locationId}
            onChange={(event) => set("locationId", event.target.value)}
            className={fieldClass}
          >
            <option value="">Choisir</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="light">
            Lumière de cette plante
          </label>
          <select
            id="light"
            value={values.light}
            onChange={(event) => set("light", event.target.value)}
            className={fieldClass}
          >
            <option value="">Comme la pièce</option>
            {LIGHT_LEVELS.map((level) => (
              <option key={level} value={level}>
                {LIGHT_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={values.nearWindow}
              onChange={(event) => set("nearWindow", event.target.checked)}
            />
            Contre la fenêtre
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={values.nearHeater}
              onChange={(event) => set("nearHeater", event.target.checked)}
            />
            Près du chauffage
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Arrosage</h2>
        <p className="text-sm text-muted-foreground">
          Un seul chiffre pour toute l&apos;année serait faux : novembre n&apos;est pas juillet. La saison en cours est encadrée. Choisir une fiche espèce remplit ces repères, tu peux les changer.
        </p>
        <div>
          <label className={labelClass} htmlFor="method">
            Comment tu arroses
          </label>
          <select
            id="method"
            value={values.wateringMethod}
            onChange={(event) => set("wateringMethod", event.target.value)}
            className={fieldClass}
          >
            {WATERING_METHODS.map((method) => (
              <option key={method} value={method}>
                {WATERING_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SEASON_FIELDS.map(({ key, field }) => (
            <div
              key={key}
              className={cn(
                "rounded-xl p-2",
                season === key ? "bg-primary/8 ring-1 ring-primary/30" : "",
              )}
            >
              <label className={labelClass} htmlFor={field}>
                {SEASON_LABELS[key]}
                {season === key ? " · maintenant" : ""}
              </label>
              <input
                id={field}
                inputMode="numeric"
                value={String(values[field] ?? "")}
                onChange={(event) => set(field, event.target.value)}
                placeholder="jours"
                className={fieldClass}
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="lastWater">
              Dernier arrosage
            </label>
            <input
              id="lastWater"
              type="date"
              value={values.lastWateredAt}
              onChange={(event) => set("lastWateredAt", event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="lastFeed">
              Dernier engrais
            </label>
            <input
              id="lastFeed"
              type="date"
              value={values.lastFertilizedAt}
              onChange={(event) => set("lastFertilizedAt", event.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={values.trackFertilizer}
            onChange={(event) => set("trackFertilizer", event.target.checked)}
          />
          Me rappeler l&apos;engrais
        </label>
        {values.trackFertilizer && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="feedDays">
                Tous les (jours)
              </label>
              <input
                id="feedDays"
                inputMode="numeric"
                value={values.fertilizeEveryDays}
                onChange={(event) => set("fertilizeEveryDays", event.target.value)}
                className={fieldClass}
              />
            </div>
            <label className="mt-7 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={values.fertilizePauseWinter}
                onChange={(event) => set("fertilizePauseWinter", event.target.checked)}
              />
              Pause d&apos;octobre à février
            </label>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">Photo et notes</h2>
        <div>
          <label className={labelClass} htmlFor="photo">
            URL de la photo
          </label>
          <input
            id="photo"
            type="url"
            value={values.photoUrl}
            onChange={(event) => set("photoUrl", event.target.value)}
            placeholder="https://"
            className={fieldClass}
          />
        </div>
        {cloudinary && (
          <div>
            <label className={labelClass} htmlFor="file">
              Ou envoyer une image
            </label>
            <input
              id="file"
              type="file"
              accept="image/*"
              className="mt-1.5 block w-full text-sm"
              disabled={uploading}
              onChange={(event) => onPhoto(event.target.files?.[0] ?? null)}
            />
            {uploading && <p className="mt-1 text-xs text-muted-foreground">Envoi…</p>}
          </div>
        )}
        {values.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={values.photoUrl} alt="" className="h-40 w-full rounded-2xl object-cover" />
        )}
        <div>
          <label className={labelClass} htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={values.notes}
            onChange={(event) => set("notes", event.target.value)}
            placeholder="Feuilles un peu recroquevillées depuis le chauffage."
            className={fieldClass}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "create" ? "Ajouter à la serre" : "Enregistrer"}
      </button>
    </form>
  );
}

export { EMPTY as emptyPlantForm };
