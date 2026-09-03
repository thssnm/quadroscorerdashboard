import { useCallback, useEffect, useRef, useState } from "react";
import { acknowledgeBoard, deleteHistoryEntry, fetchGistData, GistApiError, savePlayers } from "./gist/api";
import type { BoardEntry, HistoryEntry } from "./gist/types";
import { clearConfig, loadConfig, saveConfig } from "./gist/config";
import { SetupScreen } from "./components/SetupScreen";
import { BoardCard } from "./components/BoardCard";
import { PlayerManager } from "./components/PlayerManager";
import { HistoryList } from "./components/HistoryList";
import "./App.css";

const POLL_INTERVAL_MS = 7000;

function App() {
  const [config, setConfig] = useState(() => loadConfig());
  const [boards, setBoards] = useState<BoardEntry[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      const {
        boards: fetchedBoards,
        players: fetchedPlayers,
        history: fetchedHistory,
      } = await fetchGistData(config.token, config.gistId);
      setBoards(fetchedBoards);
      setPlayers(fetchedPlayers);
      setHistory(fetchedHistory);
      setError(null);
    } catch (e) {
      setError(e instanceof GistApiError ? e.message : "Unbekannter Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Lädt beim ersten Verbinden und danach alle POLL_INTERVAL_MS erneut.
  // refresh() setzt State erst NACH dem asynchronen fetch, nicht
  // synchron im Effekt - das ist hier bewusst so (Datenladen bei Mount),
  // keine vermeidbare Kaskade.
  useEffect(() => {
    if (!config) return;
    refresh();
    pollTimer.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [config, refresh]);

  if (!config) {
    return (
      <SetupScreen
        onSave={(token, gistId) => {
          const newConfig = { token, gistId };
          saveConfig(newConfig);
          setConfig(newConfig);
        }}
      />
    );
  }

  const handleAcknowledge = async (entry: BoardEntry) => {
    setSavingKey(entry.filename);
    try {
      await acknowledgeBoard(config.token, config.gistId, entry, history);
      await refresh();
    } catch (e) {
      setError(e instanceof GistApiError ? e.message : "Fehler beim Speichern.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleSavePlayers = async (updated: string[]) => {
    setSavingKey("players");
    setPlayers(updated); // optimistisch anzeigen, damit die Liste sofort reagiert
    try {
      await savePlayers(config.token, config.gistId, updated);
    } catch (e) {
      setError(e instanceof GistApiError ? e.message : "Fehler beim Speichern der Spielerliste.");
      await refresh(); // bei Fehler zurück auf den tatsächlichen Stand
    } finally {
      setSavingKey(null);
    }
  };

  const historyKey = (entry: HistoryEntry) => `history:${entry.acknowledgedAt}`;

  const handleDeleteHistoryEntry = async (entry: HistoryEntry) => {
    setSavingKey(historyKey(entry));
    try {
      await deleteHistoryEntry(config.token, config.gistId, history, entry.acknowledgedAt);
      await refresh();
    } catch (e) {
      setError(e instanceof GistApiError ? e.message : "Fehler beim Löschen.");
    } finally {
      setSavingKey(null);
    }
  };

  const pendingBoards = boards.filter((b) => !b.data.acknowledged);
  const pendingCount = pendingBoards.length;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Darts Dashboard</h1>
        <div className="app__header-actions">
          {loading && <span className="app__loading">Aktualisiere …</span>}
          <button
            className="settings-btn"
            onClick={() => {
              if (window.confirm("Verbindung trennen und Token/Gist-ID neu eingeben?")) {
                clearConfig();
                setConfig(null);
              }
            }}
          >
            Einstellungen
          </button>
        </div>
      </header>

      {error && (
        <div className="app__error">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <section className="app__section">
        <h2>
          Ergebnisse {pendingCount > 0 && <span className="pending-badge">{pendingCount} neu</span>}
        </h2>
        {pendingBoards.length === 0 ? (
          <p className="empty-hint">Keine offenen Ergebnisse.</p>
        ) : (
          <div className="board-grid">
            {pendingBoards.map((entry) => (
              <BoardCard
                key={entry.filename}
                entry={entry}
                onAcknowledge={handleAcknowledge}
                isSaving={savingKey === entry.filename}
              />
            ))}
          </div>
        )}
      </section>

      <section className="app__section">
        <h2>Verlauf</h2>
        <HistoryList
          history={history}
          onDelete={handleDeleteHistoryEntry}
          isDeleting={(entry) => savingKey === historyKey(entry)}
        />
      </section>

      <section className="app__section">
        <PlayerManager players={players} onSave={handleSavePlayers} isSaving={savingKey === "players"} />
      </section>
    </div>
  );
}

export default App;
