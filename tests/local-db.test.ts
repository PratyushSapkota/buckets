import "fake-indexeddb/auto";
import { beforeEach, expect, it } from "vitest";
import { clearChanges, getAllChanges, pushChange, removeChanges } from "@/lib/localDb";
import { account } from "./fixtures";
beforeEach(clearChanges);
it("removes only acknowledged records and preserves later entries", async () => {
  const first = await pushChange({ action: "account/create", account });
  const later = await pushChange({ action: "account/create", account: { ...account, name: "later" } });
  await removeChanges([first]);
  expect(await getAllChanges()).toMatchObject([{ sequence: later, account: { name: "later" } }]);
});
it("clears all pending data for authentication transitions", async () => {
  await pushChange({ action: "account/create", account });
  await clearChanges();
  expect(await getAllChanges()).toEqual([]);
});
