import ServiceUnavailable from "@/components/ServiceUnavailable";
import {
  ensureRedisAvailable,
  isRedisUnavailableError,
} from "@/lib/redis";
import { getCurrentUserId } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Login() {
  let userId: string | null;

  try {
    await ensureRedisAvailable();
    userId = await getCurrentUserId();
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      return <ServiceUnavailable service="Sign-in" />;
    }

    throw error;
  }

  if (userId) {
    redirect("/");
  }

  return (
    <main>
      <a href={"/auth/google"}>Login with google</a>
    </main>
  );
}
