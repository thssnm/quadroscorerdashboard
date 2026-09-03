export interface DashboardConfig {
  token: string;
  gistId: string;
}

const STORAGE_KEY = "darts-dashboard:config";

export const saveConfig = (config: DashboardConfig): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage kann fehlschlagen (Safari privater Modus, Speicher voll).
    // Ohne Persistenz müsste der Token nur bei jedem Neuladen erneut
    // eingegeben werden - kein kritischer Fehler.
  }
};

export const loadConfig = (): DashboardConfig | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardConfig;
  } catch {
    return null;
  }
};

export const clearConfig = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // siehe oben
  }
};
