import { useState } from "react";
import type { HistoryEntry } from "../gist/types";
import { deletedEntries } from "../gist/history";
import { HistoryEntryDetails } from "./HistoryEntryDetails";

interface TrashListProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onPurge: (entry: HistoryEntry) => void;
  isBusy: (entry: HistoryEntry) => boolean;
}

// Papierkorb: zeigt die per Soft-Delete entfernten Einträge. Standardmäßig
// eingeklappt und komplett ausgeblendet, solange nichts gelöscht wurde.
export const TrashList = ({ history, onRestore, onPurge, isBusy }: TrashListProps) => {
  const [expanded, setExpanded] = useState(false);
  const entries = deletedEntries(history);

  if (entries.length === 0) return null;

  const handlePurge = (entry: HistoryEntry) => {
    const label = `${entry.home} ${entry.legsHome}:${entry.legsGuest} ${entry.guest}`;
    if (window.confirm(`"${label}" wirklich endgültig löschen? Das lässt sich nicht rückgängig machen.`)) {
      onPurge(entry);
    }
  };

  return (
    <section className="app__section">
      <button className="section-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <span className="section-toggle__caret">{expanded ? "▾" : "▸"}</span>
        Papierkorb ({entries.length})
      </button>

      {expanded && (
        <ul className="history-list">
          {entries.map((entry) => (
            <li key={entry.acknowledgedAt} className="history-list__row">
              <HistoryEntryDetails entry={entry} />
              <div className="trash-list__actions">
                <button
                  className="history-list__delete"
                  onClick={() => onRestore(entry)}
                  disabled={isBusy(entry)}
                >
                  {isBusy(entry) ? "..." : "Wiederherstellen"}
                </button>
                <button
                  className="history-list__delete trash-list__purge"
                  onClick={() => handlePurge(entry)}
                  disabled={isBusy(entry)}
                >
                  Endgültig löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
