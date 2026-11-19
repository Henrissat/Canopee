import { cn } from "@/lib/utils";
import type { CareTone } from "@/lib/care-status";

const TONE_CLASS: Record<CareTone, string> = {
  ok: "bg-success/12 text-success",
  soon: "bg-warning/15 text-warning",
  late: "bg-accent/15 text-accent",
  unknown: "bg-muted text-muted-foreground",
  pause: "bg-secondary text-secondary-foreground",
};

export function StatusBadge({
  tone,
  label,
}: {
  tone: CareTone;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
