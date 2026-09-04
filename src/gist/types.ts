export type BoardStatus = "in_progress" | "finished";

export interface BoardResult {
  boardName: string;
  home: string;
  guest: string;
  legsHome: number;
  legsGuest: number;
  status: BoardStatus;
  highlights: string[];
  updatedAt: string; // ISO-Zeitstempel
  acknowledged: boolean;
  // Average pro Spieler für dieses eine Match - optional, weil der Scorer
  // dieses Feld aktuell noch nicht mitliefert. Sobald vorhanden, fließt es
  // in die Turnier-Statistik (Durchschnitt über alle Spiele) ein.
  averageHome?: number;
  averageGuest?: number;
}

export interface PlayersFile {
  players: string[];
}

// Ein Board-Eintrag, wie er nach dem Einlesen der Gist-Dateien im
// Dashboard verwendet wird - Dateiname wird als Board-ID mitgeführt,
// damit beim Zurückschreiben (PATCH) die richtige Datei getroffen wird.
export interface BoardEntry {
  filename: string;
  data: BoardResult;
}

// Dauerhafte Historie abgehakter Ergebnisse. Der Scorer überschreibt seine
// eigene board-<id>.json bei jedem neuen Match - ohne diese Historie würde
// ein bereits quittiertes Ergebnis beim nächsten Match auf demselben Gerät
// verloren gehen. Beim Abhaken kopiert das Dashboard den Eintrag hierher.
export interface HistoryEntry extends BoardResult {
  acknowledgedAt: string; // ISO-Zeitstempel, wann im Dashboard abgehakt wurde
}

export interface HistoryFile {
  entries: HistoryEntry[];
}
