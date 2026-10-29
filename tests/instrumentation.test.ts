import { afterEach, expect, it, vi } from "vitest";
const validate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/config", () => ({ getServerConfig: validate }));
import { register } from "@/instrumentation";
afterEach(() => { validate.mockReset(); vi.unstubAllEnvs(); });

it("validates server settings during Node startup", async () => {
  vi.stubEnv("NEXT_RUNTIME", "nodejs");
  await register();
  expect(validate).toHaveBeenCalledOnce();
});
it("propagates invalid configuration and never starts silently", async () => {
  vi.stubEnv("NEXT_RUNTIME", "nodejs");
  validate.mockImplementationOnce(() => { throw new Error("Invalid settings"); });
  await expect(register()).rejects.toThrow("Invalid settings");
});
it("does not import Node credentials into the edge runtime", async () => {
  vi.stubEnv("NEXT_RUNTIME", "edge");
  await register();
  expect(validate).not.toHaveBeenCalled();
});
