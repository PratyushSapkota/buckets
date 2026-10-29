import "server-only";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import type { SheetBatchRequest } from "./row";

function createAuth() {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getSheet(worksheet: string) {
  const auth = createAuth();

  const doc = new GoogleSpreadsheet(process.env.SERVICE_SHEET_ID!, auth);

  await doc.loadInfo();
  return doc.sheetsByTitle[worksheet];
}

export async function commitSheetBatch(requests: SheetBatchRequest[]) {
  await createAuth().request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.SERVICE_SHEET_ID!)}:batchUpdate`,
    method: "POST",
    data: { requests },
    retry: false,
  });
}
