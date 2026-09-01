import { DesktopHome } from "@/components/desktop/DesktopHome";
import { MobileHome } from "@/components/mobile/MobileHome";
import { ResponsiveHome } from "@/components/ResponsiveHome";
import { requireUser } from "@/lib/auth";

export default async function Home() {
  await requireUser();

  return <ResponsiveHome desktop={<DesktopHome />} mobile={<MobileHome />} />;
}
