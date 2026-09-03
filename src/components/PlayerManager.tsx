import { useState } from "react";

interface PlayerManagerProps {
  players: string[];
  onSave: (players: string[]) => void;
  isSaving: boolean;
}

export const PlayerManager = ({ players, onSave, isSaving }: PlayerManagerProps) => {
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed || players.includes(trimmed)) return;
    onSave([...players, trimmed]);
    setNewName("");
  };

  const handleRemove = (name: string) => {
    onSave(players.filter((p) => p !== name));
  };

  return (
    <div className="player-manager">
      <h2>Spieler</h2>
      <div className="player-manager__add">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Neuer Spielername"
          maxLength={24}
        />
        <button onClick={handleAdd} disabled={!newName.trim() || isSaving}>
          Hinzufügen
        </button>
      </div>

      {players.length === 0 ? (
        <p className="player-manager__empty">Noch keine Spieler eingetragen.</p>
      ) : (
        <ul className="player-manager__list">
          {players.map((name) => (
            <li key={name}>
              <span>{name}</span>
              <button onClick={() => handleRemove(name)} disabled={isSaving}>
                Entfernen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
