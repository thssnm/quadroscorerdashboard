import { describe, expect, it } from "vitest";
import { activeEntries, deletedEntries, isDeleted } from "./history";
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

describe("isDeleted", () => {
  it("treats entries without deletedAt as active", () => {
    expect(isDeleted(makeEntry({}))).toBe(false);
  });

  it("treats entries with deletedAt as deleted", () => {
    expect(isDeleted(makeEntry({ deletedAt: "2026-09-02T10:00:00Z" }))).toBe(true);
  });
});

describe("activeEntries / deletedEntries", () => {
  const active = makeEntry({ acknowledgedAt: "2026-09-01T10:05:00Z" });
  const deleted = makeEntry({ acknowledgedAt: "2026-09-02T10:05:00Z", deletedAt: "2026-09-03T08:00:00Z" });

  it("splits the history into both lists without losing entries", () => {
    const history = [active, deleted];
    expect(activeEntries(history)).toEqual([active]);
    expect(deletedEntries(history)).toEqual([deleted]);
  });

  it("keeps the original order", () => {
    const second = makeEntry({ acknowledgedAt: "2026-09-04T10:05:00Z" });
    expect(activeEntries([active, deleted, second]).map((e) => e.acknowledgedAt)).toEqual([
      "2026-09-01T10:05:00Z",
      "2026-09-04T10:05:00Z",
    ]);
  });
});
