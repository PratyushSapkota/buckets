import Home from "@/components/Home";
import { isRedisAvailable } from "@/lib/redis";

export default async function Page() {
  if (!(await isRedisAvailable())) {
    return <main>Service unavailable right now</main>;
  } else {
    return <Home />;
  }
}
