import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient, type PlantKind, type WateringMethod } from "@prisma/client";
import { CATALOG } from "./catalog";
import { seedDefaultLocations } from "../src/lib/default-locations";

const prisma = new PrismaClient();

async function seedCatalog() {
  for (const entry of CATALOG) {
    const species = await prisma.species.upsert({
      where: { slug: entry.slug },
      update: {
        commonName: entry.commonName,
        scientificName: entry.scientificName,
        kind: entry.kind as PlantKind,
        waterDaysWinter: entry.waterDaysWinter,
        waterDaysSpring: entry.waterDaysSpring,
        waterDaysSummer: entry.waterDaysSummer,
        waterDaysAutumn: entry.waterDaysAutumn,
        fertilizeEveryDays: entry.fertilizeEveryDays,
        defaultMethod: entry.defaultMethod as WateringMethod,
        summary: entry.summary,
        tips: entry.tips,
      },
      create: {
        slug: entry.slug,
        commonName: entry.commonName,
        scientificName: entry.scientificName,
        kind: entry.kind as PlantKind,
        waterDaysWinter: entry.waterDaysWinter,
        waterDaysSpring: entry.waterDaysSpring,
        waterDaysSummer: entry.waterDaysSummer,
        waterDaysAutumn: entry.waterDaysAutumn,
        fertilizeEveryDays: entry.fertilizeEveryDays,
        defaultMethod: entry.defaultMethod as WateringMethod,
        summary: entry.summary,
        tips: entry.tips,
      },
    });

    await prisma.symptomTip.deleteMany({ where: { speciesId: species.id } });
    if (entry.symptoms.length > 0) {
      await prisma.symptomTip.createMany({
        data: entry.symptoms.map((tip, index) => ({
          speciesId: species.id,
          symptom: tip.symptom,
          likelyCauses: tip.likelyCauses,
          whatToDo: tip.whatToDo,
          sortOrder: index,
        })),
      });
    }
  }
  console.log(`${CATALOG.length} fiches espèce à jour.`);
}

async function seedAdmin() {
  const email = (process.env.AUTH_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.AUTH_ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    console.log("Pas de AUTH_ADMIN_EMAIL / AUTH_ADMIN_PASSWORD : serre de démo ignorée.");
    return;
  }
  if (password.length < 8) {
    throw new Error("AUTH_ADMIN_PASSWORD doit faire au moins 8 caractères.");
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Serre", passwordHash },
  });

  const locations = await prisma.location.count({ where: { userId: user.id } });
  if (locations === 0) {
    await seedDefaultLocations(prisma, user.id);
    console.log("Emplacements Salon et Balcon créés pour le compte admin.");
  }

  const plants = await prisma.plant.count({ where: { userId: user.id } });
  if (plants > 0) return;

  const salon = await prisma.location.findFirst({
    where: { userId: user.id, name: "Salon" },
  });
  const monstera = await prisma.species.findUnique({
    where: { slug: "monstera-deliciosa" },
  });
  if (!salon || !monstera) return;

  const lastWateredAt = new Date();
  lastWateredAt.setDate(lastWateredAt.getDate() - 18);

  await prisma.plant.create({
    data: {
      nickname: "Monstera du salon",
      speciesId: monstera.id,
      kind: monstera.kind,
      locationId: salon.id,
      userId: user.id,
      light: "FAIBLE",
      nearWindow: true,
      nearHeater: true,
      potDiameterCm: 21,
      wateringMethod: "SUBSTRAT",
      waterDaysWinter: monstera.waterDaysWinter,
      waterDaysSpring: monstera.waterDaysSpring,
      waterDaysSummer: monstera.waterDaysSummer,
      waterDaysAutumn: monstera.waterDaysAutumn,
      trackFertilizer: true,
      fertilizeEveryDays: monstera.fertilizeEveryDays,
      fertilizePauseWinter: true,
      lastWateredAt,
      notes:
        "Contre la fenêtre, chauffage électrique, peu de lumière. Les feuilles se recroquevillent un peu depuis que le chauffage tourne.",
    },
  });
  console.log("Monstera de démo ajoutée (dernier arrosage il y a 18 jours).");
}

async function main() {
  await seedCatalog();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
