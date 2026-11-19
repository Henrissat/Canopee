import type { PrismaClient } from "@prisma/client";

/** Deux emplacements pour ne pas arriver sur un formulaire de plante vide. */
export async function seedDefaultLocations(db: PrismaClient, userId: string) {
  await db.location.createMany({
    data: [
      {
        userId,
        name: "Salon",
        kind: "INTERIEUR",
        light: "FAIBLE",
        heating: "ELECTRIQUE",
        orientation: "INCONNUE",
        notes: "Pièce de vie. Précise sur chaque plante si elle est contre la vitre ou près du chauffage.",
      },
      {
        userId,
        name: "Balcon",
        kind: "BALCON",
        light: "VIVE",
        heating: "AUCUN",
        orientation: "INCONNUE",
        notes: "Exposé à la pluie et au vent : le rythme d'été ne vaut pas pour novembre.",
      },
    ],
    skipDuplicates: true,
  });
}
