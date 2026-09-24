import "server-only";

import { getGoogleAccessToken } from "@/lib/google/accessToken";
import axios from "axios";
import { SPREADSHEET_NAME } from "./schema";

export async function findSpreadsheet(googleUserId: string) {
  const accessToken = await getGoogleAccessToken(googleUserId);

  const { data } = await axios.get(
    "https://www.googleapis.com/drive/v3/files",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: [
          `name = '${SPREADSHEET_NAME}'`,
          `mimeType = 'application/vnd.google-apps.spreadsheet'`,
          "trashed = false",
        ].join(" and "),
        fields: "files(id,name)",
        pageSize: 1,
      },
    },
  );

  return data.files[0]?.id ?? null;
}
