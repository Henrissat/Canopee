import { daysBetween, monthName, parisMonth } from "@/lib/dates";
import { SEASON_LABELS, WATERING_METHOD_LABELS, type SeasonKey } from "@/lib/labels";

export type CareTone = "ok" | "soon" | "late" | "unknown" | "pause";

type SeasonDays = {
  waterDaysWinter: number | null;
  waterDaysSpring: number | null;
  waterDaysSummer: number | null;
  waterDaysAutumn: number | null;
};

type SpeciesDays = {
  waterDaysWinter: number;
  waterDaysSpring: number;
  waterDaysSummer: number;
  waterDaysAutumn: number;
  fertilizeEveryDays?: number | null;
};

export type Waterable = SeasonDays & {
  lastWateredAt: Date | null;
  wateringMethod: keyof typeof WATERING_METHOD_LABELS;
  species: SpeciesDays | null;
};

export type Fertilizable = {
  trackFertilizer: boolean;
  fertilizeEveryDays: number | null;
  fertilizePauseWinter: boolean;
  lastFertilizedAt: Date | null;
  species: { fertilizeEveryDays: number | null } | null;
};

export function currentSeason(date = new Date()): SeasonKey {
  const month = parisMonth(date);
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "autumn";
}

/** Octobre à février : les plantes d'intérieur sont au ralenti. */
export function isFertilizerPause(date = new Date()): boolean {
  const month = parisMonth(date);
  return month >= 10 || month <= 2;
}

function seasonDays(source: SeasonDays | SpeciesDays, season: SeasonKey): number | null {
  const value = {
    winter: source.waterDaysWinter,
    spring: source.waterDaysSpring,
    summer: source.waterDaysSummer,
    autumn: source.waterDaysAutumn,
  }[season];
  return value ?? null;
}

export function resolveWaterInterval(
  plant: Waterable,
  date = new Date(),
): { days: number | null; fromSpecies: boolean; season: SeasonKey } {
  const season = currentSeason(date);
  const own = seasonDays(plant, season);
  if (own != null) return { days: own, fromSpecies: false, season };
  if (plant.species) {
    return { days: seasonDays(plant.species, season), fromSpecies: true, season };
  }
  return { days: null, fromSpecies: false, season };
}

export function waterStatus(plant: Waterable, now = new Date()) {
  const interval = resolveWaterInterval(plant, now);
  if (interval.days == null) {
    return {
      tone: "unknown" as const,
      daysRemaining: null as number | null,
      elapsed: null as number | null,
      never: !plant.lastWateredAt,
      ...interval,
    };
  }

  if (!plant.lastWateredAt) {
    return {
      tone: "late" as const,
      daysRemaining: -interval.days,
      elapsed: null,
      never: true,
      ...interval,
    };
  }

  const elapsed = daysBetween(plant.lastWateredAt, now);
  const daysRemaining = interval.days - elapsed;
  const tone: CareTone =
    daysRemaining < 0 ? "late" : daysRemaining <= 2 ? "soon" : "ok";

  return {
    tone,
    daysRemaining,
    elapsed,
    never: false,
    ...interval,
  };
}

export function waterNeedsAttention(plant: Waterable, now = new Date()): boolean {
  const status = waterStatus(plant, now);
  return status.tone === "late" || status.tone === "soon";
}

export function waterLabel(status: ReturnType<typeof waterStatus>): string {
  if (status.tone === "unknown") return "Rythme à définir";
  if (status.never) return "À arroser";
  if (status.tone === "late") return "En retard";
  if (status.tone === "soon") return "Bientôt";
  return "Au rythme";
}

export function waterDetail(plant: Waterable, now = new Date()): string {
  const status = waterStatus(plant, now);
  const method = WATERING_METHOD_LABELS[plant.wateringMethod];
  const season = SEASON_LABELS[status.season].toLowerCase();
  const month = monthName(now);

  if (status.days == null) {
    return `En ${month}, aucun rythme d'arrosage. Indique un nombre de jours pour cette saison, ou choisis une fiche espèce.`;
  }

  const source = status.fromSpecies ? "la fiche espèce propose" : "ton réglage est";
  const when = status.never
    ? "Pas encore d'arrosage enregistré."
    : status.tone === "late"
      ? `Dernier arrosage il y a ${status.elapsed} j.`
      : status.daysRemaining === 0
        ? "Prévu aujourd'hui."
        : `Prochain dans ${status.daysRemaining} j.`;

  return `En ${month} (${season}), ${source} un ${method.toLowerCase()} tous les ${status.days} jours. ${when}`;
}

export function fertilizerStatus(plant: Fertilizable, now = new Date()) {
  if (!plant.trackFertilizer) {
    return { tone: "unknown" as const, daysRemaining: null as number | null, interval: null as number | null };
  }
  if (plant.fertilizePauseWinter && isFertilizerPause(now)) {
    return { tone: "pause" as const, daysRemaining: null, interval: plant.fertilizeEveryDays };
  }

  const interval = plant.fertilizeEveryDays ?? plant.species?.fertilizeEveryDays ?? null;
  if (interval == null) {
    return { tone: "unknown" as const, daysRemaining: null, interval: null };
  }
  if (!plant.lastFertilizedAt) {
    return { tone: "late" as const, daysRemaining: -interval, interval };
  }
  const elapsed = daysBetween(plant.lastFertilizedAt, now);
  const daysRemaining = interval - elapsed;
  const tone: CareTone =
    daysRemaining < 0 ? "late" : daysRemaining <= 3 ? "soon" : "ok";
  return { tone, daysRemaining, interval };
}

export function fertilizerLabel(status: ReturnType<typeof fertilizerStatus>): string {
  if (status.tone === "pause") return "Pause engrais";
  if (status.tone === "unknown") return "Engrais non suivi";
  if (status.tone === "late") return "Engrais à faire";
  if (status.tone === "soon") return "Engrais bientôt";
  return "Engrais ok";
}

const TONE_RANK: Record<CareTone, number> = {
  late: 0,
  soon: 1,
  ok: 2,
  pause: 3,
  unknown: 4,
};

export function compareWaterUrgency(a: Waterable, b: Waterable): number {
  return TONE_RANK[waterStatus(a).tone] - TONE_RANK[waterStatus(b).tone];
}
