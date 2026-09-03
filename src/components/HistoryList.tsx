import type { HistoryEntry } from "../gist/types";

interface HistoryListProps {
  history: HistoryEntry[];
  onDelete: (entry: HistoryEntry) => void;
  isDeleting: (entry: HistoryEntry) => boolean;
}

const formatTimestamp = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const HistoryList = ({ history, onDelete, isDeleting }: HistoryListProps) => {
  if (history.length === 0) {
    return <p className="empty-hint">Noch keine abgehakten Ergebnisse.</p>;
  }

  const handleDelete = (entry: HistoryEntry) => {
    const label = `${entry.home} ${entry.legsHome}:${entry.legsGuest} ${entry.guest}`;
    if (window.confirm(`"${label}" wirklich endgültig aus dem Verlauf löschen?`)) {
      onDelete(entry);
    }
  };

  return (
    <ul className="history-list">
      {history.map((entry) => (
        <li key={entry.acknowledgedAt} className="history-list__row">
          <span className="history-list__names">
            {entry.home} <strong>{entry.legsHome}:{entry.legsGuest}</strong> {entry.guest}
          </span>
          <span className="history-list__time">{formatTimestamp(entry.acknowledgedAt)}</span>
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
