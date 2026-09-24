import "server-only";

import { getGoogleAccessToken } from "@/lib/google/accessToken";
import axios from "axios";
import { SPREADSHEET_NAME } from "./schema";

export async function createSpreadsheet(googleUserId: string) {
  const accessToken = await getGoogleAccessToken(googleUserId);
  const { data } = await axios.post(
    "https://sheets.googleapis.com/v4/spreadsheets",
    {
      properties: {
        title: SPREADSHEET_NAME,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return data.spreadsheetId;
}
