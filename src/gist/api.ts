import type { BoardEntry, BoardResult, HistoryEntry, HistoryFile, PlayersFile } from "./types";

const GITHUB_API = "https://api.github.com";

export class GistApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GistApiError";
    this.status = status;
  }
}

interface GistFile {
  filename: string;
  content: string;
}

interface GistResponse {
  files: Record<string, GistFile>;
}

const authHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
});

// Lädt den kompletten Gist und gibt die geparsten board-*.json-Dateien,
// players.json und die Historie abgehakter Ergebnisse getrennt zurück.
// Dateien, die kein gültiges JSON enthalten oder nicht dem erwarteten
// Schema entsprechen, werden stillschweigend übersprungen statt das ganze
// Dashboard zu blockieren.
export const fetchGistData = async (
  token: string,
  gistId: string
): Promise<{ boards: BoardEntry[]; players: string[]; history: HistoryEntry[] }> => {
  const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
    headers: authHeaders(token),
  });

  if (res.status === 401 || res.status === 403) {
    throw new GistApiError("Token ungültig oder ohne Berechtigung für diesen Gist.", res.status);
  }
  if (res.status === 404) {
    throw new GistApiError("Gist nicht gefunden. Gist-ID prüfen.", res.status);
  }
  if (!res.ok) {
    throw new GistApiError(`GitHub-Anfrage fehlgeschlagen (${res.status}).`, res.status);
  }

  const data = (await res.json()) as GistResponse;
  const boards: BoardEntry[] = [];
  let players: string[] = [];
  let history: HistoryEntry[] = [];

  for (const [filename, file] of Object.entries(data.files)) {
    if (!file.content) continue;
    try {
      const parsed = JSON.parse(file.content);
      if (filename === "players.json") {
        players = Array.isArray((parsed as PlayersFile).players) ? (parsed as PlayersFile).players : [];
      } else if (filename === "history.json") {
        history = Array.isArray((parsed as HistoryFile).entries) ? (parsed as HistoryFile).entries : [];
      } else if (filename.startsWith("board-")) {
        if (isValidBoardResult(parsed)) {
          boards.push({ filename, data: parsed });
        }
      }
    } catch {
      // Datei ist kein gültiges JSON - überspringen statt Dashboard zu blockieren.
      continue;
    }
  }

  boards.sort((a, b) => a.filename.localeCompare(b.filename));
  history.sort((a, b) => b.acknowledgedAt.localeCompare(a.acknowledgedAt)); // neueste zuerst
  return { boards, players, history };
};

const isValidBoardResult = (value: unknown): value is BoardResult => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.home === "string" &&
    typeof v.guest === "string" &&
    typeof v.legsHome === "number" &&
    typeof v.legsGuest === "number"
  );
};

// Überschreibt gezielt EINE Datei im Gist, alle anderen Dateien bleiben
// unangetastet (GitHub Gist PATCH mergt auf Dateiebene, nicht das ganze
// Gist-Objekt - andere Dateien müssen daher nicht mitgeschickt werden).
export const patchGistFile = async (
  token: string,
  gistId: string,
  filename: string,
  content: string
): Promise<void> => {
  const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      files: { [filename]: { content } },
    }),
  });

  if (!res.ok) {
    throw new GistApiError(`Schreiben fehlgeschlagen (${res.status}).`, res.status);
  }
};

export const acknowledgeBoard = async (
  token: string,
  gistId: string,
  entry: BoardEntry,
  currentHistory: HistoryEntry[]
): Promise<void> => {
  const updated: BoardResult = { ...entry.data, acknowledged: true };
  const historyEntry: HistoryEntry = { ...updated, acknowledgedAt: new Date().toISOString() };
  const newHistory: HistoryFile = { entries: [...currentHistory, historyEntry] };

  // Beide Dateien schreiben: die Board-Datei bekommt acknowledged=true
  // (für den Fall, dass der Scorer selbst noch mal draufschaut), UND der
  // Eintrag wandert dauerhaft in history.json - dort bleibt er auch dann
  // erhalten, wenn der Scorer beim nächsten Match dieselbe board-*.json
  // überschreibt.
  await patchGistFile(token, gistId, entry.filename, JSON.stringify(updated, null, 2));
  await patchGistFile(token, gistId, "history.json", JSON.stringify(newHistory, null, 2));
};

export const savePlayers = async (token: string, gistId: string, players: string[]): Promise<void> => {
  const content: PlayersFile = { players };
  await patchGistFile(token, gistId, "players.json", JSON.stringify(content, null, 2));
};

// Entfernt einen Eintrag dauerhaft aus der Historie. acknowledgedAt dient
// als Identifikator (beim Abhaken per new Date().toISOString() erzeugt -
// praktisch eindeutig, da zwei Abhak-Vorgänge nie exakt dieselbe
// Millisekunde treffen).
export const deleteHistoryEntry = async (
  token: string,
  gistId: string,
  currentHistory: HistoryEntry[],
  acknowledgedAt: string
): Promise<void> => {
  const updated: HistoryFile = {
    entries: currentHistory.filter((e) => e.acknowledgedAt !== acknowledgedAt),
  };
  await patchGistFile(token, gistId, "history.json", JSON.stringify(updated, null, 2));
};
