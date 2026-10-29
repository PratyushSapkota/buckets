export type SyncResult =
  | { ok: true }
  | { ok: false; code: string; message: string; issues?: { path: string; message: string }[]; retryAfterSeconds?: number };

export class LedgerError extends Error {
  constructor(
    public code: string,
    message: string,
    public issues?: { path: string; message: string }[],
    public retryAfterSeconds?: number,
  ) {
    super(message);
  }
}
