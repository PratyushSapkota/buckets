"use client";

import { useMobile } from "@/hooks/use-mobile";
import { DesktopView } from "./DesktopView";
import { MobileView } from "./MobileView";
import { Session } from "next-auth";



export function ResponsiveView() {
  const isMobile = useMobile();

  return isMobile ? <MobileView /> : <DesktopView />;
}
