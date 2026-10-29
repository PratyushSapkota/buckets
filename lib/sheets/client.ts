import "server-only";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import type { SheetBatchRequest } from "./row";
import { getServerConfig } from "../config";

function createAuth() {
  const config = getServerConfig();
  return new JWT({
    email: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getSheet(worksheet: string) {
  const auth = createAuth();

  const doc = new GoogleSpreadsheet(getServerConfig().SERVICE_SHEET_ID, auth);

  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[worksheet];
  if (!sheet) throw new Error("No ledger worksheet is configured for this account.");
  return sheet;
}

export async function commitSheetBatch(requests: SheetBatchRequest[]) {
  await createAuth().request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(getServerConfig().SERVICE_SHEET_ID)}:batchUpdate`,
    method: "POST",
    data: { requests },
    retry: false,
  });
}
