import { findSpreadsheet } from "@/feature/spreadsheet/find";

type Props = {
  userId: string;
};

export default async function SpreadsheetStatus({ userId }: Props) {
  const spreadsheetId = await findSpreadsheet(userId);

  return <div>{spreadsheetId ?? "No sheet found"}</div>;
}
