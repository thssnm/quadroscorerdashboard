import { describe, expect, it, vi, beforeEach } from "vitest";
import { acknowledgeBoard, deleteHistoryEntry, fetchGistData, GistApiError, patchGistFile } from "./api";

const validBoard = {
  boardName: "Board 1",
  home: "Alice",
  guest: "Bob",
  legsHome: 2,
  legsGuest: 0,
  status: "finished" as const,
  highlights: ["180 (Alice)"],
  updatedAt: "2026-09-01T10:00:00Z",
  acknowledged: false,
};

const mockFetchResponse = (status: number, body: unknown) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);

describe("fetchGistData", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses valid board files and players.json", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(
      mockFetchResponse(200, {
        files: {
          "board-1.json": { filename: "board-1.json", content: JSON.stringify(validBoard) },
          "players.json": { filename: "players.json", content: JSON.stringify({ players: ["Alice", "Bob"] }) },
        },
      })
    );

    const { boards, players } = await fetchGistData("token", "gist-id");
    expect(boards).toHaveLength(1);
    expect(boards[0].data.home).toBe("Alice");
    expect(players).toEqual(["Alice", "Bob"]);
  });

  it("skips files with invalid JSON instead of throwing", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(
      mockFetchResponse(200, {
        files: {
          "board-1.json": { filename: "board-1.json", content: "{not valid json" },
          "board-2.json": { filename: "board-2.json", content: JSON.stringify(validBoard) },
        },
      })
    );

    const { boards } = await fetchGistData("token", "gist-id");
    expect(boards).toHaveLength(1);
  });

  it("skips board files missing required fields", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(
      mockFetchResponse(200, {
        files: {
          "board-1.json": { filename: "board-1.json", content: JSON.stringify({ home: "Alice" }) },
        },
      })
    );

    const { boards } = await fetchGistData("token", "gist-id");
    expect(boards).toHaveLength(0);
  });

  it("throws GistApiError with status 401 on bad token", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(mockFetchResponse(401, {}));
    await expect(fetchGistData("bad-token", "gist-id")).rejects.toMatchObject({
      name: "GistApiError",
      status: 401,
    });
  });

  it("throws GistApiError with status 404 on missing gist", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(mockFetchResponse(404, {}));
    await expect(fetchGistData("token", "missing")).rejects.toBeInstanceOf(GistApiError);
  });

  it("sorts boards by filename", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(
      mockFetchResponse(200, {
        files: {
          "board-2.json": { filename: "board-2.json", content: JSON.stringify(validBoard) },
          "board-1.json": { filename: "board-1.json", content: JSON.stringify(validBoard) },
        },
      })
    );

    const { boards } = await fetchGistData("token", "gist-id");
    expect(boards.map((b) => b.filename)).toEqual(["board-1.json", "board-2.json"]);
  });

  it("parses history.json and sorts newest first", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(
      mockFetchResponse(200, {
        files: {
          "history.json": {
            filename: "history.json",
            content: JSON.stringify({
              entries: [
                { ...validBoard, acknowledgedAt: "2026-09-01T09:00:00Z" },
                { ...validBoard, acknowledgedAt: "2026-09-02T09:00:00Z" },
              ],
            }),
          },
        },
      })
    );

    const { history } = await fetchGistData("token", "gist-id");
    expect(history).toHaveLength(2);
    expect(history[0].acknowledgedAt).toBe("2026-09-02T09:00:00Z");
  });

  it("returns empty history when history.json is missing", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(mockFetchResponse(200, { files: {} }));
    const { history } = await fetchGistData("token", "gist-id");
    expect(history).toEqual([]);
  });
});

describe("patchGistFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a PATCH request scoped to the single file", async () => {
    const fetchMock = vi.fn().mockReturnValue(mockFetchResponse(200, {}));
    globalThis.fetch = fetchMock;

    await patchGistFile("token", "gist-id", "board-1.json", "{}");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/gists/gist-id"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ files: { "board-1.json": { content: "{}" } } }),
      })
    );
  });

  it("throws GistApiError when the request fails", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(mockFetchResponse(500, {}));
    await expect(patchGistFile("token", "gist-id", "board-1.json", "{}")).rejects.toBeInstanceOf(
      GistApiError
    );
  });
});

describe("acknowledgeBoard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("writes acknowledged=true to the board file AND appends to history", async () => {
    const fetchMock = vi.fn().mockReturnValue(mockFetchResponse(200, {}));
    globalThis.fetch = fetchMock;

    const entry = { filename: "board-abc.json", data: validBoard };
    await acknowledgeBoard("token", "gist-id", entry, []);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const boardCall = fetchMock.mock.calls[0];
    const boardBody = JSON.parse((boardCall[1] as RequestInit).body as string);
    expect(boardBody.files["board-abc.json"].content).toContain('"acknowledged": true');

    const historyCall = fetchMock.mock.calls[1];
    const historyBody = JSON.parse((historyCall[1] as RequestInit).body as string);
    const historyContent = JSON.parse(historyBody.files["history.json"].content);
    expect(historyContent.entries).toHaveLength(1);
    expect(historyContent.entries[0].home).toBe("Alice");
  });

  it("preserves existing history entries when appending a new one", async () => {
    const fetchMock = vi.fn().mockReturnValue(mockFetchResponse(200, {}));
    globalThis.fetch = fetchMock;

    const existingEntry = { ...validBoard, acknowledgedAt: "2026-08-01T00:00:00Z" };
    const entry = { filename: "board-abc.json", data: validBoard };
    await acknowledgeBoard("token", "gist-id", entry, [existingEntry]);

    const historyCall = fetchMock.mock.calls[1];
    const historyBody = JSON.parse((historyCall[1] as RequestInit).body as string);
    const historyContent = JSON.parse(historyBody.files["history.json"].content);
    expect(historyContent.entries).toHaveLength(2);
    expect(historyContent.entries[0].acknowledgedAt).toBe("2026-08-01T00:00:00Z");
  });
});

describe("deleteHistoryEntry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("removes only the matching entry by acknowledgedAt", async () => {
    const fetchMock = vi.fn().mockReturnValue(mockFetchResponse(200, {}));
    globalThis.fetch = fetchMock;

    const entryA = { ...validBoard, acknowledgedAt: "2026-08-01T00:00:00Z" };
    const entryB = { ...validBoard, acknowledgedAt: "2026-08-02T00:00:00Z" };

    await deleteHistoryEntry("token", "gist-id", [entryA, entryB], "2026-08-01T00:00:00Z");

    const call = fetchMock.mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);
    const content = JSON.parse(body.files["history.json"].content);
    expect(content.entries).toHaveLength(1);
    expect(content.entries[0].acknowledgedAt).toBe("2026-08-02T00:00:00Z");
  });

  it("throws GistApiError when the write fails", async () => {
    globalThis.fetch = vi.fn().mockReturnValue(mockFetchResponse(500, {}));
    const entry = { ...validBoard, acknowledgedAt: "2026-08-01T00:00:00Z" };
    await expect(deleteHistoryEntry("token", "gist-id", [entry], "2026-08-01T00:00:00Z")).rejects.toBeInstanceOf(
      GistApiError
    );
  });
});
