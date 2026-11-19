# Canopée

Serre personnelle : plantes d'intérieur, de balcon et de jardin. Même socle que Wainsera (Next.js, Prisma, Neon, Auth.js, Vercel).

Un compte = une collection privée. Les visiteurs non connectés peuvent lire la serre du compte `AUTH_ADMIN_EMAIL`, sans rien modifier.

## Décisions

L'arrosage n'est pas un nombre de jours valable toute l'année. Chaque plante a un rythme par saison (hiver, printemps, été, automne). La fiche espèce préremplit ces chiffres ; le tien les remplace.

Le microclimat est sur l'emplacement (intérieur / balcon / jardin, lumière, chauffage, orientation). La plante dit seulement si elle est contre la fenêtre ou près du chauffage, et comment l'eau est donnée : substrat, substrat + feuillage, immersion, soucoupe, brumisation.

Les conseils (feuilles recroquevillées, etc.) sont des fiches par espèce. Ce sont des pistes, pas un diagnostic. Pas de scan photo dans cette version.

## Phases

| Phase | Contenu | État |
| --- | --- | --- |
| 0 | Auth, schéma, seed, README | fait |
| 1 | Plantes, lieux, inventaire filtrable, statut d'arrosage, « j'ai arrosé » | fait |
| 2 | Page À faire (arrosage, engrais, autres soins), historique exploitable | à venir |
| 3 | Accueil plus composé : répartition par pièce, sans graphique générique | ébauche sur l'accueil |
| 4 | Import CSV, courbe des soins | à venir |
| plus tard | Boutures comme plantes filles, météo balcon/jardin, rappel email. Scan feuille seulement s'il existe un palier gratuit (PlantNet). | hors MVP |

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL (Neon)
- Auth.js, email et mot de passe
- Photos : URL, ou Cloudinary (preset non signé, plan gratuit)

## Première configuration

1. Compte gratuit sur [Neon](https://console.neon.tech).
2. Copie `.env.example` vers `.env` (déjà présent en local) et remplace `DATABASE_URL` par la connection string. Pour `db:push`, l'URL directe est plus fiable que le pooler.
3. Renseigne `AUTH_SECRET` (`openssl rand -base64 32`).
4. Crée les tables et le catalogue :

```bash
npm run db:push
npm run db:seed
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Le seed crée les fiches espèce (dont la monstera) et, si `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD` sont définis, un compte avec un salon, un balcon, et une monstera dont le dernier arrosage date de 18 jours.

Sur Vercel : les mêmes variables d'environnement. `npm run build` lance `prisma generate`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | App en local |
| `npm run db:push` | Applique le schéma |
| `npm run db:seed` | Catalogue + serre de démo |
| `npm run db:studio` | Prisma Studio |
| `npm run build` | Build de production |
