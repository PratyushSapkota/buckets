import { getUser, signOut } from "@/lib/auth";
import { Button } from "../ui/button";

export async function AccountControl() {
  const user = await getUser();
  return (
    <div className="mt-auto m-3 flex flex-row justify-between">
      <div>{user?.email}</div>
      <form action={signOut}>
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </div>
  );
}
