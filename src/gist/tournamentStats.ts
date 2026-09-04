import type { HistoryEntry } from "./types";
import { groupHighlightsByCategory, parseHighlight } from "./highlightParser";

export interface PlayerTournamentStats {
  name: string;
  average: number | null; // null solange kein Match einen Average-Wert mitliefert
  gamesPlayed: number;
  gamesWon: number;
  highlightLines: string[]; // bereits nach Kategorie gruppiert und formatiert
}

// Fasst alle Historie-Einträge zu einer Turnier-Statistik pro Spieler
// zusammen: Durchschnitt der Match-Averages (nur über Matches, die einen
// Average-Wert mitliefern), Spiele/Siege, und die eigenen Highlights nach
// Kategorie gruppiert. Highlights werden über den im Text enthaltenen
// Spielernamen zugeordnet, nicht pauschal beiden Match-Teilnehmern.
export const computeTournamentStats = (history: HistoryEntry[]): PlayerTournamentStats[] => {
  const byName = new Map<
    string,
    { averages: number[]; gamesPlayed: number; gamesWon: number; highlights: ReturnType<typeof parseHighlight>[] }
  >();

  const ensure = (name: string) => {
    if (!byName.has(name)) {
      byName.set(name, { averages: [], gamesPlayed: 0, gamesWon: 0, highlights: [] });
    }
    return byName.get(name)!;
  };

  for (const entry of history) {
    const home = ensure(entry.home);
    home.gamesPlayed += 1;
    if (entry.legsHome > entry.legsGuest) home.gamesWon += 1;
    if (typeof entry.averageHome === "number") home.averages.push(entry.averageHome);

    const guest = ensure(entry.guest);
    guest.gamesPlayed += 1;
    if (entry.legsGuest > entry.legsHome) guest.gamesWon += 1;
    if (typeof entry.averageGuest === "number") guest.averages.push(entry.averageGuest);

    // Jeder Highlight-Text nennt genau einen Spielernamen - dem wird er
    // zugeordnet, nicht pauschal beiden Match-Teilnehmern.
    for (const text of entry.highlights) {
      const parsed = parseHighlight(text);
      if (!parsed) continue;
      if (parsed.playerName === entry.home) home.highlights.push(parsed);
      else if (parsed.playerName === entry.guest) guest.highlights.push(parsed);
    }
  }

  const result: PlayerTournamentStats[] = [];
  for (const [name, data] of byName.entries()) {
    const average =
      data.averages.length > 0 ? data.averages.reduce((sum, a) => sum + a, 0) / data.averages.length : null;
    const validHighlights = data.highlights.filter((h): h is NonNullable<typeof h> => h !== null);
    result.push({
      name,
      average,
      gamesPlayed: data.gamesPlayed,
      gamesWon: data.gamesWon,
      highlightLines: groupHighlightsByCategory(validHighlights),
    });
  }

  // Absteigend nach Average - Spieler ohne Average-Wert (null) landen am Ende.
  result.sort((a, b) => {
    if (a.average === null && b.average === null) return a.name.localeCompare(b.name);
    if (a.average === null) return 1;
    if (b.average === null) return -1;
    return b.average - a.average;
  });
  return result;
};
