import "server-only";
import { ensureSpreadsheet } from "./ensure";
import { ensureSpreadsheetSchema } from "./ensureSchema";

export async function initializeSpreadsheet(googleUserId: string) {
  const spreadsheetId = await ensureSpreadsheet(googleUserId);

  await ensureSpreadsheetSchema(googleUserId, spreadsheetId);

  return spreadsheetId;
}
