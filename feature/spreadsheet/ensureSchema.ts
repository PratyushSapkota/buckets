import "server-only";

import { getGoogleAccessToken } from "@/lib/google/accessToken";
import axios from "axios";
import { SHEET_SCHEMA, WORKSHEET_NAME } from "./schema";
import { columnToLetter } from "./utils";

export async function ensureSpreadsheetSchema(
  googleUserId: string,
  spreadsheetId: string,
) {
  const accessToken = await getGoogleAccessToken(googleUserId);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const worksheetId = await getWorksheetId(spreadsheetId, headers);

  await ensureNamedRanges(spreadsheetId, headers, worksheetId);
  await ensureNamedColumnHeaders(spreadsheetId, WORKSHEET_NAME, headers);
}

async function getWorksheetId(
  spreadsheetId: string,
  headers: { Authorization: string },
) {
  const { data } = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: headers,
      params: {
        fields: "sheets.properties",
      },
    },
  );
  let worksheet = data.sheets.find(
    (sheet: any) => sheet.properties.title === WORKSHEET_NAME,
  );
  if (!worksheet) {
    worksheet = await createWorksheet(spreadsheetId, headers);
  }

  return worksheet.properties.sheetId;
}

async function createWorksheet(
  spreadsheetId: string,
  headers: { Authorization: string },
) {
  const { data } = await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      requests: [
        {
          addSheet: { properties: { title: WORKSHEET_NAME } },
        },
      ],
    },
    { headers: headers },
  );
  return data.replies[0].addSheet;
}

async function ensureNamedRanges(
  spreadsheetId: string,
  headers: { Authorization: string },
  worksheetId: number,
) {
  const { data } = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers,
      params: {
        fields: "namedRanges(name)",
      },
    },
  );

  const existingNames = new Set(
    data.namedRanges?.map((range: any) => range.name) ?? [],
  );

  const requests = Object.entries(SHEET_SCHEMA)
    .filter(([name]) => !existingNames.has(name))
    .map(([name, schema]) => ({
      addNamedRange: {
        namedRange: {
          name,
          range: {
            sheetId: worksheetId,
            startColumnIndex: schema.startColumnIndex,
            endColumnIndex: schema.endColumnIndex,
          },
        },
      },
    }));

  if (requests.length === 0) {
    return;
  }

  await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    { requests },
    { headers },
  );
}

async function ensureNamedColumnHeaders(
  spreadsheetId: string,
  worksheetName: string,
  headers: { Authorization: string },
) {
  for (const [name, schema] of Object.entries(SHEET_SCHEMA)) {
    const range = `${worksheetName}!${columnToLetter(
      schema.startColumnIndex,
    )}1:${columnToLetter(schema.endColumnIndex - 1)}1`;

    const { data } = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      { headers },
    );

    const currentHeaders = data.values?.[0] ?? [];

    if (
      currentHeaders.length === schema.columns.length &&
      currentHeaders.every(
        (value: string, index: number) => value === schema.columns[index],
      )
    ) {
      continue;
    }

    await axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        range,
        majorDimension: "ROWS",
        values: [schema.columns],
      },
      {
        headers,
        params: {
          valueInputOption: "RAW",
        },
      },
    );
  }
}
