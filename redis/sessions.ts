import "server-only";
import { randomBytes } from "node:crypto";
import { withRedis } from "./client";

export const SESSION_TTL = 30 * 24 * 60 * 60;
export const HANDSHAKE_TTL = 10 * 60;
export const randomId = () => randomBytes(32).toString("hex");
export const validId = (id: string) => /^[a-f0-9]{64}$/.test(id);
export async function createSession(sub: string) {
  const id = randomId();
  await withRedis((client) => client.set(`session:${id}`, sub, { EX: SESSION_TTL }));
  return id;
}
export async function readSession(id?: string): Promise<string | null> {
  if (!id || !validId(id)) return null;
  return withRedis((client) => client.get(`session:${id}`));
}
export async function deleteSession(id?: string) {
  if (id && validId(id)) await withRedis((client) => client.del(`session:${id}`));
}
export async function createHandshake() {
  const state = randomId();
  const nonce = randomId();
  await withRedis((client) => client.set(`oauth:${state}`, nonce, { EX: HANDSHAKE_TTL }));
  return { state, nonce };
}
export async function consumeHandshake(state: string) {
  if (!validId(state)) return null;
  return withRedis((client) => client.getDel(`oauth:${state}`));
}
