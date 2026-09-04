import { describe, expect, it } from "vitest";
import { groupHighlightsByCategory, parseHighlight } from "./highlightParser";

describe("parseHighlight", () => {
  it("parses a shortleg highlight", () => {
    expect(parseHighlight("17 Darts (Alice)")).toEqual({
      category: "shortleg",
      value: 17,
      playerName: "Alice",
    });
  });

  it("parses a highfinish highlight", () => {
    expect(parseHighlight("132 Finish (Bob)")).toEqual({
      category: "highfinish",
      value: 132,
      playerName: "Bob",
    });
  });

  it("parses a highscore highlight", () => {
    expect(parseHighlight("180 (Alice)")).toEqual({
      category: "highscore",
      value: 180,
      playerName: "Alice",
    });
  });

  it("returns null for unrecognized text", () => {
    expect(parseHighlight("some random text")).toBeNull();
  });

  it("handles player names containing spaces", () => {
    expect(parseHighlight("180 (Max Mustermann)")).toEqual({
      category: "highscore",
      value: 180,
      playerName: "Max Mustermann",
    });
  });
});

describe("groupHighlightsByCategory", () => {
  it("groups and counts per category", () => {
    const parsed = [
      { category: "highscore" as const, value: 180, playerName: "Alice" },
      { category: "highscore" as const, value: 240, playerName: "Alice" },
      { category: "highfinish" as const, value: 132, playerName: "Alice" },
    ];
    expect(groupHighlightsByCategory(parsed)).toEqual([
      "Highscore (2): 240, 180",
      "Highfinish (1): 132",
    ]);
  });

  it("sorts shortleg values ascending (fewer darts is better)", () => {
    const parsed = [
      { category: "shortleg" as const, value: 16, playerName: "Alice" },
      { category: "shortleg" as const, value: 9, playerName: "Alice" },
    ];
    expect(groupHighlightsByCategory(parsed)).toEqual(["Shortleg (2): 9, 16"]);
  });

  it("returns empty array for no highlights", () => {
    expect(groupHighlightsByCategory([])).toEqual([]);
  });
});
