import { useState } from "react";

interface SetupScreenProps {
  onSave: (token: string, gistId: string) => void;
}

export const SetupScreen = ({ onSave }: SetupScreenProps) => {
  const [token, setToken] = useState("");
  const [gistId, setGistId] = useState("");

  const canSubmit = token.trim().length > 0 && gistId.trim().length > 0;

  return (
    <div className="setup-screen">
      <h1>Dashboard einrichten</h1>
      <p className="setup-hint">
        Zum Empfangen der Ergebnisse wird ein GitHub Personal Access Token benötigt, das nur
        Zugriff auf Gists hat (Scope <code>gist</code>) — kein Zugriff auf Repositories oder
        andere Daten deines Accounts nötig. Erstellbar unter GitHub → Settings → Developer
        settings → Personal access tokens.
      </p>

      <div className="setup-row">
        <label>GitHub Token</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_..."
        />
      </div>

      <div className="setup-row">
        <label>Gist-ID</label>
        <input
          value={gistId}
          onChange={(e) => setGistId(e.target.value)}
          placeholder="z.B. a1b2c3d4e5f6..."
        />
        <p className="setup-hint setup-hint--small">
          Die ID steht im letzten Teil der Gist-URL, z.B.
          github.com/username/<strong>a1b2c3d4e5f6</strong>
        </p>
      </div>

      <button
        className="start-btn"
        disabled={!canSubmit}
        onClick={() => onSave(token.trim(), gistId.trim())}
      >
        Speichern und verbinden
      </button>
    </div>
  );
};
