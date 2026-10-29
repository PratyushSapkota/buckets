import { beforeEach, expect, it, vi } from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("google-auth-library", () => ({ JWT: class { request = request; } }));
import { commitSheetBatch } from "@/lib/sheets/client";
beforeEach(() => {
  request.mockReset();
  vi.stubEnv("SERVICE_SHEET_ID", "test-sheet");
  vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "test-key");
});
it("sends one authenticated batch with transport retries disabled", async () => {
  await commitSheetBatch([]);
  expect(request).toHaveBeenCalledExactlyOnceWith({ url: "https://sheets.googleapis.com/v4/spreadsheets/test-sheet:batchUpdate", method: "POST", data: { requests: [] }, retry: false });
});
