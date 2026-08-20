import { requireUser } from "@/lib/auth/require-user";

export async function requireUserDatabase() {
  const user = await requireUser();

  return 
}



