import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@components/ui/sidebar";
import { ToggleTheme } from "@components/ui/toggle-theme";
import * as React from "react";

import { NAV_ITEMS_ARRAY } from "../../config";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <SidebarProvider onOpenChange={setOpen} open={open}>
      <div className="flex w-full items-center justify-end md:hidden">
        <SidebarTrigger className="z-50" />
        <Sidebar
          className="border-l border-border bg-background"
          collapsible="offcanvas"
          side="right"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS_ARRAY.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={false}>
                        <a className="text-lg font-medium" href={item.href}>
                          {item.label}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t border-border/50 p-4">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground/50 uppercase">
                Appearance
              </span>
              <div className="flex justify-center rounded-2xl bg-foreground/5 p-2">
                <ToggleTheme />
              </div>
            </div>
          </div>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}
