/** Calendrier Europe/Paris, pour que « aujourd'hui » ne bascule pas à 1 h du matin en été. */

export function parisDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function parisMonth(date = new Date()): number {
  return Number(parisDateKey(date).slice(5, 7));
}

export function daysBetween(from: Date, to: Date): number {
  const ms = Date.parse(parisDateKey(to)) - Date.parse(parisDateKey(from));
  return Math.round(ms / 86_400_000);
}

export function formatDay(date: Date | null): string {
  if (!date) return "jamais";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function monthName(date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    month: "long",
  }).format(date);
}

export function toDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  return parisDateKey(date);
}
