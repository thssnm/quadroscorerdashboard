import type { HistoryEntry } from "../gist/types";

interface HistoryEntryDetailsProps {
  entry: HistoryEntry;
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

// Gemeinsame Darstellung eines Historie-Eintrags für Verlauf und
// Papierkorb - im Papierkorb kommt nur der Löschzeitpunkt dazu, damit
// beide Listen sonst identisch aussehen.
export const HistoryEntryDetails = ({ entry }: HistoryEntryDetailsProps) => (
  <div className="history-list__main">
    <div className="history-list__top">
      <span className="history-list__board">{entry.boardName}</span>
      <span className="history-list__time">{formatTimestamp(entry.acknowledgedAt)}</span>
    </div>
    <span className="history-list__names">
      {entry.home} <strong>{entry.legsHome}:{entry.legsGuest}</strong> {entry.guest}
    </span>
    {entry.highlights.length > 0 && (
      <ul className="history-list__highlights">
        {entry.highlights.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    )}
    {entry.deletedAt && (
      <span className="history-list__deleted-at">Gelöscht: {formatTimestamp(entry.deletedAt)}</span>
    )}
  </div>
);
