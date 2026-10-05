import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  request: vi.fn(),
  constructor: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("redis", () => ({
  createClient: () => ({
    isReady: true,
    isOpen: true,
    on: vi.fn(),
    get: mocks.get,
    set: mocks.set,
  }),
}));
vi.mock("google-auth-library", () => ({
  JWT: class {
    constructor(options: unknown) { mocks.constructor(options); }
    request = mocks.request;
  },
}));

import { ensureWorksheet } from "@/spreadsheet/worksheet";
import { spreadsheetConfig, SpreadsheetError } from "@/spreadsheet/client";
import { RedisUnavailableError } from "@/redis/client";

const cacheKey = "worksheet:shared-sheet:user-sub";
const metadata = (id: number, title = "user-sub") => ({
  data: { sheets: [{ properties: { sheetId: id, title } }] },
});
const created = (id: number) => ({
  data: { replies: [{ addSheet: { properties: { sheetId: id } } }] },
});

beforeEach(() => {
  vi.stubEnv("SERVICE_SHEET_ID", "shared-sheet");
  vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL", "service@example.test");
  vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "-----BEGIN PRIVATE KEY-----\\nexample\\n-----END PRIVATE KEY-----");
  vi.stubEnv("REDIS_URL", "redis://localhost:6379");
  mocks.get.mockReset().mockResolvedValue(null);
  mocks.set.mockReset().mockResolvedValue("OK");
  mocks.request.mockReset();
  mocks.constructor.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe("worksheet resolution", () => {
  it.each([0, 42])("trusts cached worksheet ID %s without Google requests", async (id) => {
    mocks.get.mockResolvedValue(String(id));
    expect(await ensureWorksheet("user-sub")).toBe(id);
    expect(mocks.get).toHaveBeenCalledWith(cacheKey);
    expect(mocks.constructor).not.toHaveBeenCalled();
    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it.each([0, 42])("reuses existing worksheet %s and caches without expiration", async (id) => {
    mocks.request.mockResolvedValueOnce(metadata(id));
    expect(await ensureWorksheet("user-sub")).toBe(id);
    expect(mocks.request).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      method: "GET",
      url: "https://sheets.googleapis.com/v4/spreadsheets/shared-sheet",
      params: { fields: "sheets(properties(sheetId,title))" },
      timeout: 10000,
      retry: false,
    }));
    expect(mocks.set).toHaveBeenCalledExactlyOnceWith(cacheKey, String(id));
  });
  it("creates a worksheet and its schema in one batch when the exact user title is missing", async () => {
    mocks.request.mockResolvedValueOnce(metadata(1, "other-user")).mockResolvedValueOnce(created(9));
    expect(await ensureWorksheet("user-sub")).toBe(9);
    expect(mocks.request).toHaveBeenNthCalledWith(2, expect.objectContaining({
      method: "POST",
      url: "https://sheets.googleapis.com/v4/spreadsheets/shared-sheet:batchUpdate",
      retry: false,
    }));
    const requests = mocks.request.mock.calls[1][0].data.requests;
    expect(requests).toHaveLength(7);
    const properties = requests[0].addSheet.properties;
    expect(properties).toEqual({
      sheetId: expect.any(Number),
      title: "user-sub",
      gridProperties: { rowCount: 1000, columnCount: 25 },
    });
    for (const request of requests.slice(1)) {
      expect(request.updateCells.start.sheetId).toBe(properties.sheetId);
    }
    expect(mocks.request.mock.calls.map(([options]) => options.method)).toEqual(["GET", "POST"]);
    expect(mocks.set).toHaveBeenCalledWith(cacheKey, "9");
  });
  it("isolates users and spreadsheets in Redis keys", async () => {
    mocks.get.mockResolvedValue("7");
    await ensureWorksheet("first-user");
    await ensureWorksheet("second-user");
    vi.stubEnv("SERVICE_SHEET_ID", "another-sheet");
    await ensureWorksheet("first-user");
    expect(mocks.get.mock.calls.map(([key]) => key)).toEqual([
      "worksheet:shared-sheet:first-user", "worksheet:shared-sheet:second-user", "worksheet:another-sheet:first-user",
    ]);
  });
  it.each(["-1", "", "NaN", "1.5", "9007199254740992"])("recovers invalid cached ID %s from Sheets", async (value) => {
    mocks.get.mockResolvedValue(value);
    mocks.request.mockResolvedValueOnce(metadata(0));
    expect(await ensureWorksheet("user-sub")).toBe(0);
    expect(mocks.set).toHaveBeenCalledWith(cacheKey, "0");
  });
  it.each(["duplicate title", "response timeout"])("recovers a %s creation failure by rereading", async (reason) => {
    mocks.request.mockResolvedValueOnce({ data: { sheets: [] } })
      .mockRejectedValueOnce(new Error(reason))
      .mockResolvedValueOnce(metadata(77));
    expect(await ensureWorksheet("user-sub")).toBe(77);
    expect(mocks.request.mock.calls.map(([options]) => options.method)).toEqual(["GET", "POST", "GET"]);
    expect(mocks.set).toHaveBeenCalledWith(cacheKey, "77");
  });
  it("fails when creation fails and no matching worksheet is found", async () => {
    mocks.request.mockResolvedValueOnce({ data: { sheets: [] } })
      .mockRejectedValueOnce(new Error("upstream credentials"))
      .mockResolvedValueOnce(metadata(2, "someone-else"));
    await expect(ensureWorksheet("user-sub")).rejects.toThrow(SpreadsheetError);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it("fails closed on metadata permission errors without creating or caching", async () => {
    mocks.request.mockRejectedValue(new Error("403 private response"));
    await expect(ensureWorksheet("user-sub")).rejects.toThrow("Worksheet setup failed. Try again.");
    expect(mocks.request).toHaveBeenCalledOnce();
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it("does not accept an invalid Google worksheet ID", async () => {
    mocks.request.mockResolvedValueOnce(metadata(-1));
    await expect(ensureWorksheet("user-sub")).rejects.toThrow(SpreadsheetError);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it("recovers a malformed creation response through metadata lookup", async () => {
    mocks.request.mockResolvedValueOnce({ data: { sheets: [] } })
      .mockResolvedValueOnce({ data: { replies: [] } })
      .mockResolvedValueOnce(metadata(8));
    expect(await ensureWorksheet("user-sub")).toBe(8);
  });
  it("stops on Redis read failure before contacting Google", async () => {
    mocks.get.mockRejectedValueOnce(new Error("redis credentials"));
    await expect(ensureWorksheet("user-sub")).rejects.toThrow(RedisUnavailableError);
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("can reuse the created worksheet after a cache-write failure", async () => {
    mocks.request.mockResolvedValueOnce({ data: { sheets: [] } }).mockResolvedValueOnce(created(55));
    mocks.set.mockRejectedValueOnce(new Error("redis unavailable"));
    await expect(ensureWorksheet("user-sub")).rejects.toThrow(RedisUnavailableError);
    mocks.request.mockResolvedValueOnce(metadata(55));
    expect(await ensureWorksheet("user-sub")).toBe(55);
    expect(mocks.request.mock.calls.filter(([options]) => options.method === "POST")).toHaveLength(1);
  });
  it.each(["SERVICE_SHEET_ID", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"])("rejects missing %s", async (name) => {
    vi.stubEnv(name, "");
    await expect(ensureWorksheet("user-sub")).rejects.toThrow(SpreadsheetError);
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("normalizes escaped private-key newlines and uses only the service-account Sheets scope", async () => {
    mocks.request.mockResolvedValueOnce(metadata(1));
    expect(spreadsheetConfig().key).toContain("\nexample\n");
    await ensureWorksheet("user-sub");
    expect(mocks.constructor).toHaveBeenCalledWith({
      email: "service@example.test",
      key: "-----BEGIN PRIVATE KEY-----\nexample\n-----END PRIVATE KEY-----",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      transporterOptions: { timeout: 10000, retry: false },
    });
  });
  it("rejects empty user identity", async () => {
    await expect(ensureWorksheet(" ")).rejects.toThrow(SpreadsheetError);
    expect(mocks.get).not.toHaveBeenCalled();
  });
});
