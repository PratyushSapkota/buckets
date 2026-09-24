import { initializeSpreadsheet } from "@/feature/spreadsheet";

type Props = {
  userId: string;
};

export default async function SpreadsheetStatus({ userId }: Props) {
  const spreadsheetId = await initializeSpreadsheet(userId);

  return <div>{spreadsheetId ?? "No sheet found"}</div>;
}
