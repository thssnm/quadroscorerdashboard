import type { HistoryEntry } from "./types";

// Zentrale Stelle für die Trennung aktiv/gelöscht. fetchGistData liefert
// bewusst weiterhin ALLE Einträge aus history.json - sonst wäre der
// Papierkorb leer. Wer nur die aktiven bzw. nur die gelöschten Einträge
// braucht, filtert über diese Helfer.
export const isDeleted = (entry: HistoryEntry): boolean => typeof entry.deletedAt === "string";

export const activeEntries = (history: HistoryEntry[]): HistoryEntry[] => history.filter((e) => !isDeleted(e));

export const deletedEntries = (history: HistoryEntry[]): HistoryEntry[] => history.filter(isDeleted);
