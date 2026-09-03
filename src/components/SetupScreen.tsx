import { useState } from "react";

interface SetupScreenProps {
  onSave: (gistId: string) => void;
}

export const SetupScreen = ({ onSave }: SetupScreenProps) => {
  const [gistId, setGistId] = useState("");

  const canSubmit = gistId.trim().length > 0;

  return (
    <div className="setup-screen">
      <h1>Dashboard einrichten</h1>
      <p className="setup-hint">
        Der GitHub-Token ist fest in dieser Bereitstellung hinterlegt. Trage hier nur noch die
        ID des Gists ein, aus dem Ergebnisse empfangen werden sollen.
      </p>

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

      <button className="start-btn" disabled={!canSubmit} onClick={() => onSave(gistId.trim())}>
        Speichern und verbinden
      </button>
    </div>
  );
};
