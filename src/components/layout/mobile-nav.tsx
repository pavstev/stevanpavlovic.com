import { SidebarTrigger } from "@components/ui/sidebar";
import { type FC } from "react";

export const MobileNav: FC = () => (
  <div className="flex w-full items-center justify-end md:hidden">
    <SidebarTrigger className="z-50" />
  </div>
);
