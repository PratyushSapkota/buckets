// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ButtonHTMLAttributes } from "react";
const mocks = vi.hoisted(() => ({ clear: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/localDb", () => ({ clearChanges: mocks.clear }));
vi.mock("next-auth/react", () => ({ signIn: mocks.signIn, signOut: mocks.signOut }));
vi.mock("@mantine/core", () => ({ Button: (props: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} /> }));
import AuthButton from "@/app/components/auth-button";

describe("authentication cleanup", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.clear.mockResolvedValue(undefined); });
  afterEach(cleanup);
  it.each(["signIn", "signOut"] as const)("waits for cleanup before %s", async (action) => {
    let finish!: () => void;
    mocks.clear.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    render(<AuthButton action={action} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mocks[action]).not.toHaveBeenCalled();
    finish();
    await waitFor(() => expect(mocks[action]).toHaveBeenCalledOnce());
  });
  it.each(["signIn", "signOut"] as const)("blocks %s when cleanup fails", async (action) => {
    mocks.clear.mockRejectedValue(new Error("storage unavailable"));
    render(<AuthButton action={action} />);
    fireEvent.click(screen.getByRole("button"));
    expect((await screen.findByRole("alert")).textContent).toContain("Unable to clear");
    expect(mocks[action]).not.toHaveBeenCalled();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(false);
  });
});
