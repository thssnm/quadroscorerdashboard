import type { BoardEntry } from "../gist/types";

interface BoardCardProps {
  entry: BoardEntry;
  onAcknowledge: (entry: BoardEntry) => void;
  isSaving: boolean;
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

export const BoardCard = ({ entry, onAcknowledge, isSaving }: BoardCardProps) => {
  const { data } = entry;
  const needsAttention = !data.acknowledged;

  return (
    <div className={`board-card ${needsAttention ? "board-card--pending" : ""}`}>
      <div className="board-card__header">
        <span className="board-card__name">{data.boardName}</span>
        <span className={`board-card__status board-card__status--${data.status}`}>
          {data.status === "finished" ? "Beendet" : "Läuft"}
        </span>
      </div>

      <div className="board-card__score">
        <span>{data.home}</span>
        <span className="board-card__legs">
          {data.legsHome} : {data.legsGuest}
        </span>
        <span>{data.guest}</span>
      </div>

      {data.highlights.length > 0 && (
        <ul className="board-card__highlights">
          {data.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      <div className="board-card__footer">
        <span className="board-card__time">{formatTimestamp(data.updatedAt)}</span>
        {needsAttention ? (
          <button
            className="ack-btn"
            onClick={() => onAcknowledge(entry)}
            disabled={isSaving}
          >
            {isSaving ? "..." : "✓ Übertragen"}
          </button>
        ) : (
          <span className="ack-done">Übertragen ✓</span>
        )}
      </div>
    </div>
  );
};
