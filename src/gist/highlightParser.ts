export type HighlightCategory = "highscore" | "highfinish" | "shortleg";

export interface ParsedHighlight {
  category: HighlightCategory;
  value: number;
  playerName: string;
}

// Erkennt die drei festen Highlight-Formate, die der Scorer erzeugt:
// - "<Darts> Darts (<Name>)"   -> shortleg (Leg in wenigen Darts gewonnen)
// - "<Punkte> Finish (<Name>)" -> highfinish (hohes Checkout)
// - "<Punkte> (<Name>)"        -> highscore (hohe Aufnahme, kein Finish-Text)
// Reihenfolge der Prüfung ist wichtig: "Finish" und "Darts" müssen vor dem
// generischen Highscore-Fall geprüft werden, da deren Text ebenfalls auf
// "(<Name>)" endet.
export const parseHighlight = (text: string): ParsedHighlight | null => {
  const shortlegMatch = text.match(/^(\d+)\s+Darts\s+\(([^)]+)\)$/);
  if (shortlegMatch) {
    return { category: "shortleg", value: Number(shortlegMatch[1]), playerName: shortlegMatch[2] };
  }

  const finishMatch = text.match(/^(\d+)\s+Finish\s+\(([^)]+)\)$/);
  if (finishMatch) {
    return { category: "highfinish", value: Number(finishMatch[1]), playerName: finishMatch[2] };
  }

  const scoreMatch = text.match(/^(\d+)\s+\(([^)]+)\)$/);
  if (scoreMatch) {
    return { category: "highscore", value: Number(scoreMatch[1]), playerName: scoreMatch[2] };
  }

  return null;
};

const CATEGORY_LABELS: Record<HighlightCategory, string> = {
  highscore: "Highscore",
  highfinish: "Highfinish",
  shortleg: "Shortleg",
};

// Gruppiert bereits gefilterte (auf einen Spieler beschränkte) Highlights
// nach Kategorie und formatiert sie als "Kategorie (Anzahl): Wert, Wert, ...".
// Werte werden absteigend sortiert (höchster/beste zuerst).
export const groupHighlightsByCategory = (parsed: ParsedHighlight[]): string[] => {
  const byCategory = new Map<HighlightCategory, number[]>();
  for (const h of parsed) {
    if (!byCategory.has(h.category)) byCategory.set(h.category, []);
    byCategory.get(h.category)!.push(h.value);
  }

  const order: HighlightCategory[] = ["highscore", "highfinish", "shortleg"];
  const lines: string[] = [];
  for (const category of order) {
    const values = byCategory.get(category);
    if (!values || values.length === 0) continue;
    const sorted = [...values].sort((a, b) => (category === "shortleg" ? a - b : b - a));
    lines.push(`${CATEGORY_LABELS[category]} (${values.length}): ${sorted.join(", ")}`);
  }
  return lines;
};
