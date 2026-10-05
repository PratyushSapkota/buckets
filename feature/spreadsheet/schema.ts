import { MODEL_SCHEMA } from "../models";

export const SPREADSHEET_NAME = "buckets";

export const WORKSHEET_NAME = "data";

let currentIndex = 0;

export const SHEET_SCHEMA = Object.fromEntries(
  Object.entries(MODEL_SCHEMA).map(([key, model]) => {
    const columns = Object.keys(model);

    const startColumnIndex = currentIndex;
    const endColumnIndex = currentIndex + columns.length;

    currentIndex = endColumnIndex;

    return [
      key,
      {
        startColumnIndex,
        endColumnIndex,
        columns,
      },
    ];
  }),
);
