import type { Prisma } from "@prisma/client";
import type { PlantFormValues } from "@/components/plant-form";
import { toDateInput } from "@/lib/dates";
import {
  compareWaterUrgency,
  fertilizerLabel,
  fertilizerStatus,
  waterDetail,
  waterLabel,
  waterNeedsAttention,
  waterStatus,
  type CareTone,
} from "@/lib/care-status";
import { plantInclude } from "@/lib/plant-input";
import {
  HEATING_LABELS,
  LIGHT_LABELS,
  LOCATION_KIND_LABELS,
  ORIENTATION_LABELS,
  PLANT_KIND_LABELS,
  WATERING_METHOD_LABELS,
} from "@/lib/labels";

export type PlantRecord = Prisma.PlantGetPayload<{ include: typeof plantInclude }>;

export type PlantCardModel = {
  id: string;
  nickname: string;
  speciesLabel: string;
  kindLabel: string;
  locationName: string;
  locationId: string;
  kind: string;
  photoUrl: string | null;
  waterTone: CareTone;
  waterLabel: string;
  waterDetail: string;
  attention: boolean;
  createdAt: string;
};

export function speciesLabel(plant: {
  species: { commonName: string } | null;
  customSpeciesName: string | null;
}): string {
  return plant.species?.commonName ?? plant.customSpeciesName ?? "Espèce à préciser";
}

export function toPlantCard(plant: PlantRecord): PlantCardModel {
  const status = waterStatus(plant);
  return {
    id: plant.id,
    nickname: plant.nickname,
    speciesLabel: speciesLabel(plant),
    kindLabel: PLANT_KIND_LABELS[plant.kind],
    locationName: plant.location.name,
    locationId: plant.locationId,
    kind: plant.kind,
    photoUrl: plant.media[0]?.url ?? null,
    waterTone: status.tone,
    waterLabel: waterLabel(status),
    waterDetail: waterDetail(plant),
    attention: waterNeedsAttention(plant),
    createdAt: plant.createdAt.toISOString(),
  };
}

export function sortPlants(plants: PlantRecord[], sort: string): PlantRecord[] {
  const copy = [...plants];
  if (sort === "nom") {
    copy.sort((a, b) => a.nickname.localeCompare(b.nickname, "fr"));
    return copy;
  }
  if (sort === "urgence") {
    copy.sort((a, b) => compareWaterUrgency(a, b) || b.createdAt.getTime() - a.createdAt.getTime());
    return copy;
  }
  copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return copy;
}

export function placeSummary(plant: PlantRecord): string[] {
  const light = plant.light ?? plant.location.light;
  const lines = [
    `${plant.location.name} · ${LOCATION_KIND_LABELS[plant.location.kind]}`,
    `Lumière ${LIGHT_LABELS[light].toLowerCase()}${plant.light ? " (cette plante)" : " (la pièce)"}`,
    HEATING_LABELS[plant.location.heating],
  ];
  if (plant.location.orientation !== "INCONNUE") {
    lines.push(`Fenêtre ${ORIENTATION_LABELS[plant.location.orientation].toLowerCase()}`);
  }
  if (plant.nearWindow) lines.push("Contre la fenêtre");
  if (plant.nearHeater) lines.push("Près du chauffage");
  if (plant.potDiameterCm) lines.push(`Pot ${plant.potDiameterCm} cm`);
  lines.push(WATERING_METHOD_LABELS[plant.wateringMethod]);
  return lines;
}

export function toFormValues(plant: PlantRecord): PlantFormValues {
  return {
    nickname: plant.nickname,
    speciesId: plant.speciesId ?? "",
    customSpeciesName: plant.customSpeciesName ?? "",
    kind: plant.kind,
    acquiredAt: toDateInput(plant.acquiredAt),
    locationId: plant.locationId,
    light: plant.light ?? "",
    nearWindow: plant.nearWindow,
    nearHeater: plant.nearHeater,
    potDiameterCm: plant.potDiameterCm != null ? String(plant.potDiameterCm) : "",
    wateringMethod: plant.wateringMethod,
    waterDaysWinter: plant.waterDaysWinter != null ? String(plant.waterDaysWinter) : "",
    waterDaysSpring: plant.waterDaysSpring != null ? String(plant.waterDaysSpring) : "",
    waterDaysSummer: plant.waterDaysSummer != null ? String(plant.waterDaysSummer) : "",
    waterDaysAutumn: plant.waterDaysAutumn != null ? String(plant.waterDaysAutumn) : "",
    trackFertilizer: plant.trackFertilizer,
    fertilizeEveryDays:
      plant.fertilizeEveryDays != null ? String(plant.fertilizeEveryDays) : "",
    fertilizePauseWinter: plant.fertilizePauseWinter,
    lastWateredAt: toDateInput(plant.lastWateredAt),
    lastFertilizedAt: toDateInput(plant.lastFertilizedAt),
    notes: plant.notes ?? "",
    photoUrl: plant.media[0]?.url ?? "",
  };
}

export function fertilizerSummary(plant: PlantRecord): { tone: CareTone; label: string } {
  const status = fertilizerStatus(plant);
  return { tone: status.tone, label: fertilizerLabel(status) };
}
