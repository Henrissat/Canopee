"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Loader2, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

async function postCare(plantId: string, kind: "ARROSAGE" | "FERTILISATION") {
  const res = await fetch(`/api/plants/${plantId}/soins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Enregistrement impossible");
  }
}

export function WaterButton({
  plantId,
  compact = false,
}: {
  plantId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      await postCare(plantId, "ARROSAGE");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
          compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
        )}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Droplets className="h-3.5 w-3.5" />}
        J&apos;ai arrosé
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FertilizeButton({ plantId }: { plantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      await postCare(plantId, "FERTILISATION");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sprout className="h-3.5 w-3.5" />}
        J&apos;ai mis de l&apos;engrais
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ArchiveButton({
  plantId,
  archived,
}: {
  plantId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (
      !archived &&
      !window.confirm("Archiver cette plante ? Elle quitte l'inventaire. L'historique reste.")
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plants/${plantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: archived ? "restore" : "archive" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Action impossible");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-60"
      >
        {loading ? "…" : archived ? "Réactiver" : "Archiver"}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
