import { useState } from "react";
import type { HistoryEntry } from "../gist/types";
import { activeEntries } from "../gist/history";
import { HistoryEntryDetails } from "./HistoryEntryDetails";

interface HistoryListProps {
  history: HistoryEntry[];
  onDelete: (entry: HistoryEntry) => void;
  isDeleting: (entry: HistoryEntry) => boolean;
}

// Bekommt die komplette Historie und blendet die in den Papierkorb
// verschobenen Einträge (deletedAt gesetzt) selbst aus. Standardmäßig
// eingeklappt, wie Spieler und Papierkorb.
export const HistoryList = ({ history, onDelete, isDeleting }: HistoryListProps) => {
  const [expanded, setExpanded] = useState(false);
  const entries = activeEntries(history);

  const handleDelete = (entry: HistoryEntry) => {
    const label = `${entry.home} ${entry.legsHome}:${entry.legsGuest} ${entry.guest}`;
    if (window.confirm(`"${label}" in den Papierkorb verschieben?`)) {
      onDelete(entry);
    }
  };

  return (
    <>
      <button className="section-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <span className="section-toggle__caret">{expanded ? "▾" : "▸"}</span>
        Verlauf ({entries.length})
      </button>

      {expanded &&
        (entries.length === 0 ? (
          <p className="empty-hint">Noch keine abgehakten Ergebnisse.</p>
        ) : (
          <ul className="history-list">
            {entries.map((entry) => (
              <li key={entry.acknowledgedAt} className="history-list__row">
                <HistoryEntryDetails entry={entry} />
                <button
                  className="history-list__delete"
                  onClick={() => handleDelete(entry)}
                  disabled={isDeleting(entry)}
                >
                  {isDeleting(entry) ? "..." : "Löschen"}
                </button>
              </li>
            ))}
          </ul>
        ))}
    </>
  );
};
