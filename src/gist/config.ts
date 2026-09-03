// Der GitHub-Token kommt aus einer Build-Zeit-Umgebungsvariable (VITE_GITHUB_TOKEN),
// analog zum Scorer-Projekt - landet damit fest im Browser-Bundle statt manuell
// im UI eingegeben zu werden. Nur die Gist-ID bleibt editierbar und wird lokal
// pro Gerät gespeichert.
export const getEnvToken = (): string | undefined => import.meta.env.VITE_GITHUB_TOKEN as string | undefined;

const STORAGE_KEY = "darts-dashboard:gist-id";

export const saveGistId = (gistId: string): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, gistId);
  } catch {
    // localStorage kann fehlschlagen (Safari privater Modus, Speicher voll).
    // Ohne Persistenz müsste die Gist-ID nur bei jedem Neuladen erneut
    // eingegeben werden - kein kritischer Fehler.
  }
};

export const loadGistId = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const clearGistId = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // siehe oben
  }
};
