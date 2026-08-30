import { requireUser } from "@/lib/auth";

export async function AccountControl() {
  const user = await requireUser();
  return (
    <div className="mt-auto flex flex-row justify-between">
      <div>{user.email}</div>
      <div>Sign out</div>
    </div>
  );
}
