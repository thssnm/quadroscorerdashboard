import { describe, expect, it } from "vitest";
import { computeTournamentStats } from "./tournamentStats";
import type { HistoryEntry } from "./types";

const makeEntry = (overrides: Partial<HistoryEntry>): HistoryEntry => ({
  boardName: "Board 1",
  home: "Alice",
  guest: "Bob",
  legsHome: 2,
  legsGuest: 0,
  status: "finished",
  highlights: [],
  updatedAt: "2026-09-01T10:00:00Z",
  acknowledged: true,
  acknowledgedAt: "2026-09-01T10:05:00Z",
  ...overrides,
});

describe("computeTournamentStats", () => {
  it("returns empty array for empty history", () => {
    expect(computeTournamentStats([])).toEqual([]);
  });

  it("counts games played per player across multiple matches", () => {
    const history = [
      makeEntry({ home: "Alice", guest: "Bob" }),
      makeEntry({ home: "Alice", guest: "Charlie" }),
    ];
    const stats = computeTournamentStats(history);
    const alice = stats.find((s) => s.name === "Alice");
    expect(alice?.gamesPlayed).toBe(2);
  });

  it("counts games won based on leg score", () => {
    const history = [
      makeEntry({ home: "Alice", guest: "Bob", legsHome: 3, legsGuest: 1 }),
      makeEntry({ home: "Alice", guest: "Bob", legsHome: 0, legsGuest: 3 }),
    ];
    const stats = computeTournamentStats(history);
    expect(stats.find((s) => s.name === "Alice")?.gamesWon).toBe(1);
    expect(stats.find((s) => s.name === "Bob")?.gamesWon).toBe(1);
  });

  it("averages only matches that provide an average value", () => {
    const history = [
      makeEntry({ home: "Alice", averageHome: 60 }),
      makeEntry({ home: "Alice", averageHome: 80 }),
      makeEntry({ home: "Alice" }), // kein Average-Wert - fließt nicht ein
    ];
    const stats = computeTournamentStats(history);
    const alice = stats.find((s) => s.name === "Alice");
    expect(alice?.average).toBe(70);
    expect(alice?.gamesPlayed).toBe(3);
  });

  it("returns null average when no match provides a value", () => {
    const stats = computeTournamentStats([makeEntry({ home: "Alice" })]);
    expect(stats.find((s) => s.name === "Alice")?.average).toBeNull();
  });

  it("assigns highlights only to the named player, not both participants", () => {
    const history = [
      makeEntry({ home: "Alice", guest: "Bob", highlights: ["180 (Alice)", "17 Darts (Bob)"] }),
    ];
    const stats = computeTournamentStats(history);
    expect(stats.find((s) => s.name === "Alice")?.highlightLines).toEqual(["Highscore (1): 180"]);
    expect(stats.find((s) => s.name === "Bob")?.highlightLines).toEqual(["Shortleg (1): 17"]);
  });

  it("groups multiple highlights of the same category with counts", () => {
    const history = [
      makeEntry({
        home: "Alice",
        guest: "Bob",
        highlights: ["180 (Alice)", "240 (Alice)", "132 Finish (Alice)"],
      }),
    ];
    const stats = computeTournamentStats(history);
    const alice = stats.find((s) => s.name === "Alice");
    expect(alice?.highlightLines).toEqual(["Highscore (2): 240, 180", "Highfinish (1): 132"]);
  });

  it("sorts players by average descending, null averages last", () => {
    const history = [
      makeEntry({ home: "Alice", guest: "Bob", averageHome: 60, averageGuest: 90 }),
      makeEntry({ home: "Charlie", guest: "Dana" }), // keine Averages
    ];
    const stats = computeTournamentStats(history);
    expect(stats.map((s) => s.name)).toEqual(["Bob", "Alice", "Charlie", "Dana"]);
  });
});
