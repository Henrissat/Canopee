import {
  HeatingKind,
  LightLevel,
  LocationKind,
  Orientation,
} from "@prisma/client";

export type LocationWrite = {
  name: string;
  kind: LocationKind;
  light: LightLevel;
  heating: HeatingKind;
  orientation: Orientation;
  notes: string | null;
};

function oneOf<T extends string>(value: unknown, allowed: readonly T[], label: string): T | { error: string } {
  const key = String(value ?? "");
  if (!(allowed as readonly string[]).includes(key)) return { error: `${label} invalide` };
  return key as T;
}

export function parseLocationBody(
  body: Record<string, unknown>,
): { data: LocationWrite } | { error: string } {
  const name = String(body.name ?? "").trim();
  if (!name) return { error: "Le nom est obligatoire" };
  if (name.length > 60) return { error: "Le nom est trop long" };

  const kind = oneOf(body.kind, Object.values(LocationKind), "Type de lieu");
  if (typeof kind !== "string") return kind;
  const light = oneOf(body.light, Object.values(LightLevel), "Lumière");
  if (typeof light !== "string") return light;
  const heating = oneOf(body.heating, Object.values(HeatingKind), "Chauffage");
  if (typeof heating !== "string") return heating;
  const orientation = oneOf(body.orientation, Object.values(Orientation), "Orientation");
  if (typeof orientation !== "string") return orientation;

  const notes = body.notes ? String(body.notes).trim() : null;
  if (notes && notes.length > 1000) return { error: "Notes trop longues" };

  return {
    data: {
      name,
      kind: kind as LocationKind,
      light: light as LightLevel,
      heating: heating as HeatingKind,
      orientation: orientation as Orientation,
      notes: notes || null,
    },
  };
}
