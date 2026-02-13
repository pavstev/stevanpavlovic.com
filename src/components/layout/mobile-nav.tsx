import { SidebarProvider, SidebarTrigger } from "@components/ui/sidebar";
import * as React from "react";

import { AppSidebar } from "./app-sidebar";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <SidebarProvider onOpenChange={setOpen} open={open}>
      <div className="flex w-full items-center justify-end md:hidden">
        <SidebarTrigger className="z-50" />
        <AppSidebar collapsible="offcanvas" side="right" />
      </div>
    </SidebarProvider>
  );
}
