type Props = {
  spreadsheetId: string;
};

export default function SpreadsheetStatus({ spreadsheetId }: Props) {
  return <div>{spreadsheetId}</div>;
}
