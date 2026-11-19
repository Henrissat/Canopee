import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-3xl">Introuvable</h1>
      <p className="mt-2 text-sm text-muted-foreground">Cette page ne fait pas partie de la serre.</p>
      <Link href="/" className="mt-6 inline-flex text-sm text-primary">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
