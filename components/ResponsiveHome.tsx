"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHome } from "./mobile/MobileHome";
import { DesktopHome } from "./desktop/DesktopHome";
import { ReactNode } from "react";
import { Spinner } from "./ui/spinner";

export function ResponsiveHome({
  desktop,
  mobile,
}: {
  desktop: ReactNode;
  mobile: ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile == undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  return isMobile ? mobile : desktop;
}
