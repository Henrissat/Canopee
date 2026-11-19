import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { waterNeedsAttention } from "@/lib/care-status";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Canopée — serre personnelle",
  description: "Plantes d'intérieur, de balcon et de jardin : emplacement, arrosage, engrais.",
};

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('canopee-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let dueCount = 0;

  if (session?.user?.id) {
    try {
      const plants = await prisma.plant.findMany({
        where: { userId: session.user.id, status: "ACTIVE" },
        select: {
          lastWateredAt: true,
          wateringMethod: true,
          waterDaysWinter: true,
          waterDaysSpring: true,
          waterDaysSummer: true,
          waterDaysAutumn: true,
          species: {
            select: {
              waterDaysWinter: true,
              waterDaysSpring: true,
              waterDaysSummer: true,
              waterDaysAutumn: true,
            },
          },
        },
      });
      dueCount = plants.filter((plant) => waterNeedsAttention(plant)).length;
    } catch {
      dueCount = 0;
    }
  }

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fraunces.variable} ${sourceSans.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full overflow-x-hidden font-sans">
        <AppShell
          dueCount={dueCount}
          userEmail={session?.user?.email}
          userName={session?.user?.name}
          isLoggedIn={!!session?.user}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
