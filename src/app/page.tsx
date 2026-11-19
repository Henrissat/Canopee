import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getViewUserId } from "@/lib/view-user";
import { monthName } from "@/lib/dates";
import { plantInclude } from "@/lib/plant-input";
import { sortPlants, toPlantCard } from "@/lib/plant-view";
import { PlantCard } from "@/components/plant-card";
import { ErrorState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

const DB_HINT =
  "Renseigne DATABASE_URL (Neon) dans .env, puis npm run db:push et npm run db:seed.";

export default async function HomePage() {
  const session = await auth();
  const canWrite = !!session?.user;
  const userId = await getViewUserId();
  const month = monthName();

  let dbError = false;
  let activeCount = 0;
  let dueCount = 0;
  let lateCount = 0;
  let roomCount = 0;
  let rooms: { name: string; count: number }[] = [];
  let dueCards: ReturnType<typeof toPlantCard>[] = [];
  let recentCards: ReturnType<typeof toPlantCard>[] = [];

  try {
    if (userId) {
      const plants = await prisma.plant.findMany({
        where: { userId, status: "ACTIVE" },
        include: plantInclude,
      });
      const locations = await prisma.location.count({ where: { userId } });
      roomCount = locations;
      activeCount = plants.length;

      const cards = plants.map(toPlantCard);
      dueCount = cards.filter((card) => card.attention).length;
      lateCount = cards.filter((card) => card.waterTone === "late").length;

      const byRoom = new Map<string, number>();
      for (const plant of plants) {
        byRoom.set(plant.location.name, (byRoom.get(plant.location.name) ?? 0) + 1);
      }
      rooms = [...byRoom.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));

      dueCards = sortPlants(
        plants.filter((plant) => toPlantCard(plant).attention),
        "urgence",
      )
        .slice(0, 4)
        .map(toPlantCard);
      recentCards = sortPlants(plants, "recent").slice(0, 4).map(toPlantCard);
    }
  } catch (error) {
    console.error(error);
    dbError = true;
  }

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
          {canWrite ? "Ta serre" : userId ? "Serre publique" : "Canopée"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {firstName ? `Bonjour ${firstName}.` : "Ce qui pousse chez toi."}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          En {month}, un calendrier d&apos;été ne veut rien dire. La lumière, le chauffage et la date du dernier arrosage décident.
        </p>
      </header>

      {dbError && (
        <ErrorState title="Base inaccessible" description={DB_HINT} />
      )}

      {!dbError && !userId && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Crée un compte pour ta collection. Chaque serre reste privée.
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Créer ma serre
          </Link>
        </div>
      )}

      {!dbError && userId && (
        <>
          {!canWrite && (
            <p className="text-sm text-muted-foreground">Lecture seule — serre du compte admin.</p>
          )}

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            <Stat label="Plantes" value={activeCount} />
            <Stat label="À arroser" value={dueCount} />
            <Stat label="En retard" value={lateCount} />
            <Stat label="Lieux" value={roomCount} />
          </dl>

          {rooms.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {rooms.map((room) => `${room.name} · ${room.count}`).join("   ")}
            </p>
          )}

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl">À arroser</h2>
              <Link href="/plantes?soin=arroser" className="text-sm text-primary">
                Tout voir
              </Link>
            </div>
            {dueCards.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                Rien d&apos;urgent. Les plantes au rythme n&apos;apparaissent pas ici.
              </p>
            ) : (
              <div className="space-y-2">
                {dueCards.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} canWrite={canWrite} layout="row" />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl">Ajoutées récemment</h2>
              <Link href="/plantes" className="text-sm text-primary">
                Inventaire
              </Link>
            </div>
            {recentCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {canWrite ? "Ajoute ta première plante." : "Cette serre est vide."}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recentCards.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} canWrite={canWrite} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-4 py-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-3xl text-foreground">{value}</dd>
    </div>
  );
}
