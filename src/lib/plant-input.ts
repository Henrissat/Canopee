import {
  LightLevel,
  PlantKind,
  WateringMethod,
  type Prisma,
} from "@prisma/client";

export type PlantWrite = {
  nickname: string;
  speciesId: string | null;
  customSpeciesName: string | null;
  kind: PlantKind;
  acquiredAt: Date | null;
  locationId: string;
  light: LightLevel | null;
  nearWindow: boolean;
  nearHeater: boolean;
  potDiameterCm: number | null;
  wateringMethod: WateringMethod;
  waterDaysWinter: number | null;
  waterDaysSpring: number | null;
  waterDaysSummer: number | null;
  waterDaysAutumn: number | null;
  trackFertilizer: boolean;
  fertilizeEveryDays: number | null;
  fertilizePauseWinter: boolean;
  lastWateredAt: Date | null;
  lastFertilizedAt: Date | null;
  notes: string | null;
  photoUrl: string | null;
};

function optStr(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s || null;
}

function optInt(
  value: unknown,
  min: number,
  max: number,
): number | null | "invalid" {
  if (value === "" || value == null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return "invalid";
  return n;
}

function optDate(value: unknown): Date | null | "invalid" {
  if (value === "" || value == null) return null;
  const s = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "invalid";
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "invalid";
  return d;
}

function optUrl(value: unknown): string | null | "invalid" {
  const s = optStr(value);
  if (!s) return null;
  try {
    const url = new URL(s);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "invalid";
    return url.toString();
  } catch {
    return "invalid";
  }
}

export function parsePlantBody(
  body: Record<string, unknown>,
): { data: PlantWrite } | { error: string } {
  const nickname = String(body.nickname ?? "").trim();
  if (!nickname) return { error: "Le nom de la plante est obligatoire" };
  if (nickname.length > 80) return { error: "Le nom est trop long (80 caractères max.)" };

  const speciesId = optStr(body.speciesId);
  const customSpeciesName = speciesId ? null : optStr(body.customSpeciesName);
  if (!speciesId && !customSpeciesName) {
    return { error: "Choisis une espèce dans la liste, ou saisis-en une" };
  }

  const kind = String(body.kind ?? "") as PlantKind;
  if (!Object.values(PlantKind).includes(kind)) {
    return { error: "Type de plante invalide" };
  }

  const locationId = String(body.locationId ?? "").trim();
  if (!locationId) return { error: "L'emplacement est obligatoire" };

  const lightRaw = optStr(body.light);
  let light: LightLevel | null = null;
  if (lightRaw) {
    if (!Object.values(LightLevel).includes(lightRaw as LightLevel)) {
      return { error: "Luminosité invalide" };
    }
    light = lightRaw as LightLevel;
  }

  const wateringMethod = String(body.wateringMethod ?? "") as WateringMethod;
  if (!Object.values(WateringMethod).includes(wateringMethod)) {
    return { error: "Mode d'arrosage invalide" };
  }

  const acquiredAt = optDate(body.acquiredAt);
  if (acquiredAt === "invalid") return { error: "Date d'acquisition invalide" };
  const lastWateredAt = optDate(body.lastWateredAt);
  if (lastWateredAt === "invalid") return { error: "Date du dernier arrosage invalide" };
  const lastFertilizedAt = optDate(body.lastFertilizedAt);
  if (lastFertilizedAt === "invalid") return { error: "Date du dernier engrais invalide" };

  const seasons = {
    waterDaysWinter: optInt(body.waterDaysWinter, 1, 120),
    waterDaysSpring: optInt(body.waterDaysSpring, 1, 120),
    waterDaysSummer: optInt(body.waterDaysSummer, 1, 120),
    waterDaysAutumn: optInt(body.waterDaysAutumn, 1, 120),
  };
  if (Object.values(seasons).some((value) => value === "invalid")) {
    return { error: "Chaque saison se règle entre 1 et 120 jours, ou se laisse vide" };
  }

  const fertilizeEveryDays = optInt(body.fertilizeEveryDays, 1, 365);
  if (fertilizeEveryDays === "invalid") {
    return { error: "L'intervalle d'engrais doit être entre 1 et 365 jours" };
  }

  const potDiameterCm = optInt(body.potDiameterCm, 3, 200);
  if (potDiameterCm === "invalid") {
    return { error: "Le diamètre du pot doit être entre 3 et 200 cm" };
  }

  const photoUrl = optUrl(body.photoUrl);
  if (photoUrl === "invalid") {
    return { error: "L'URL de la photo doit commencer par http:// ou https://" };
  }

  const notes = optStr(body.notes);
  if (notes && notes.length > 4000) return { error: "Les notes sont trop longues" };

  const trackFertilizer = Boolean(body.trackFertilizer);

  return {
    data: {
      nickname,
      speciesId,
      customSpeciesName,
      kind,
      acquiredAt,
      locationId,
      light,
      nearWindow: Boolean(body.nearWindow),
      nearHeater: Boolean(body.nearHeater),
      potDiameterCm,
      wateringMethod,
      waterDaysWinter: seasons.waterDaysWinter as number | null,
      waterDaysSpring: seasons.waterDaysSpring as number | null,
      waterDaysSummer: seasons.waterDaysSummer as number | null,
      waterDaysAutumn: seasons.waterDaysAutumn as number | null,
      trackFertilizer,
      fertilizeEveryDays: trackFertilizer ? fertilizeEveryDays : null,
      fertilizePauseWinter: body.fertilizePauseWinter !== false,
      lastWateredAt,
      lastFertilizedAt,
      notes,
      photoUrl,
    },
  };
}

export function plantData(input: PlantWrite, userId: string): Prisma.PlantCreateInput {
  return {
    nickname: input.nickname,
    customSpeciesName: input.customSpeciesName,
    kind: input.kind,
    acquiredAt: input.acquiredAt,
    light: input.light,
    nearWindow: input.nearWindow,
    nearHeater: input.nearHeater,
    potDiameterCm: input.potDiameterCm,
    wateringMethod: input.wateringMethod,
    waterDaysWinter: input.waterDaysWinter,
    waterDaysSpring: input.waterDaysSpring,
    waterDaysSummer: input.waterDaysSummer,
    waterDaysAutumn: input.waterDaysAutumn,
    trackFertilizer: input.trackFertilizer,
    fertilizeEveryDays: input.fertilizeEveryDays,
    fertilizePauseWinter: input.fertilizePauseWinter,
    lastWateredAt: input.lastWateredAt,
    lastFertilizedAt: input.lastFertilizedAt,
    notes: input.notes,
    user: { connect: { id: userId } },
    location: { connect: { id: input.locationId } },
    ...(input.speciesId
      ? { species: { connect: { id: input.speciesId } } }
      : {}),
  };
}

export const plantInclude = {
  location: true,
  species: {
    include: {
      symptoms: { orderBy: { sortOrder: "asc" as const } },
    },
  },
  media: { orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;
