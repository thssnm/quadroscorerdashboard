import type { HistoryEntry } from "../gist/types";
import { activeEntries } from "../gist/history";
import { HistoryEntryDetails } from "./HistoryEntryDetails";

interface HistoryListProps {
  history: HistoryEntry[];
  onDelete: (entry: HistoryEntry) => void;
  isDeleting: (entry: HistoryEntry) => boolean;
}

// Bekommt die komplette Historie und blendet die in den Papierkorb
// verschobenen Einträge (deletedAt gesetzt) selbst aus.
export const HistoryList = ({ history, onDelete, isDeleting }: HistoryListProps) => {
  const entries = activeEntries(history);

  if (entries.length === 0) {
    return <p className="empty-hint">Noch keine abgehakten Ergebnisse.</p>;
  }

  const handleDelete = (entry: HistoryEntry) => {
    const label = `${entry.home} ${entry.legsHome}:${entry.legsGuest} ${entry.guest}`;
    if (window.confirm(`"${label}" in den Papierkorb verschieben?`)) {
      onDelete(entry);
    }
  };

  return (
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
  );
};
