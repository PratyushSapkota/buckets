import "server-only";
import { JWT } from "google-auth-library";
import { randomInt } from "node:crypto";
import { worksheetCreationRequests } from "./schema";

export class SpreadsheetError extends Error {
  constructor() {
    super("Worksheet setup failed. Try again.");
  }
}

export function spreadsheetConfig() {
  const spreadsheetId = process.env.SERVICE_SHEET_ID?.trim();
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!spreadsheetId || !email || !key) throw new SpreadsheetError();
  return { spreadsheetId, email, key };
}

export const validWorksheetId = (id: unknown): id is number =>
  typeof id === "number" && Number.isSafeInteger(id) && id >= 0;

type Properties = { sheetId?: number; title?: string };
type Metadata = { sheets?: { properties?: Properties }[] };
type CreatedSheet = { replies?: { addSheet?: { properties?: Properties } }[] };

export function spreadsheetClient(config: ReturnType<typeof spreadsheetConfig>) {
  const auth = new JWT({
    email: config.email,
    key: config.key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    transporterOptions: { timeout: 10000, retry: false },
  });
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}`;

  return {
    async findWorksheet(sub: string): Promise<number | null> {
      const { data } = await auth.request<Metadata>({
        url,
        method: "GET",
        params: { fields: "sheets(properties(sheetId,title))" },
        timeout: 10000,
        retry: false,
      });
      const properties = data.sheets?.find((sheet) => sheet.properties?.title === sub)?.properties;
      if (!properties) return null;
      if (!validWorksheetId(properties.sheetId)) throw new SpreadsheetError();
      return properties.sheetId;
    },
    async createWorksheet(sub: string): Promise<number> {
      const sheetId = randomInt(0, 2147483647);
      const { data } = await auth.request<CreatedSheet>({
        url: `${url}:batchUpdate`,
        method: "POST",
        params: { fields: "replies(addSheet(properties(sheetId)))" },
        data: { requests: worksheetCreationRequests(sub, sheetId) },
        timeout: 10000,
        retry: false,
      });
      const id = data.replies?.[0]?.addSheet?.properties?.sheetId;
      if (!validWorksheetId(id)) throw new SpreadsheetError();
      return id;
    },
  };
}
