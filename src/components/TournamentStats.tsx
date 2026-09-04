import type { PlayerTournamentStats } from "../gist/tournamentStats";

interface TournamentStatsProps {
  stats: PlayerTournamentStats[];
}

export const TournamentStats = ({ stats }: TournamentStatsProps) => {
  if (stats.length === 0) {
    return <p className="empty-hint">Noch keine Turnier-Statistik verfügbar.</p>;
  }

  return (
    <table className="tournament-stats">
      <thead>
        <tr>
          <th>Name</th>
          <th>Ø</th>
          <th>Spiele</th>
          <th>Siege</th>
          <th>Highlights</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((player) => (
          <tr key={player.name}>
            <td>{player.name}</td>
            <td>{player.average !== null ? player.average.toFixed(1) : "–"}</td>
            <td>{player.gamesPlayed}</td>
            <td>{player.gamesWon}</td>
            <td className="tournament-stats__highlights">
              {player.highlightLines.length > 0 ? (
                <ul>
                  {player.highlightLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                "–"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
