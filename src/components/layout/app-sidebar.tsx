"use client";

import { cn } from "@client/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Separator } from "@components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@components/ui/sidebar";
import { ToggleTheme } from "@components/ui/toggle-theme";
import { ExternalLinkIcon } from "lucide-react";
import * as React from "react";

import { NAV_ITEMS_ARRAY, PROFILE, SOCIALS } from "../../config";

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const [pathname, setPathname] = React.useState("");

  React.useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Avatar className="size-10 rounded-lg border">
            <AvatarImage alt={PROFILE.name} src={PROFILE.avatar.src} />
            <AvatarFallback className="rounded-lg">SP</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{PROFILE.name}</span>
            <span className="truncate text-xs text-muted-foreground">{PROFILE.role}</span>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="gap-0">
        <SidebarMenu className="p-2">
          {NAV_ITEMS_ARRAY.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                  <a href={item.href}>
                    {/* Convert string icon name to simple generic icon if needed,
                        but NAV_ITEMS likely has specific icon strings.
                        For now we just render text or we could map icons if we had a mapping.
                        Since we accept children, we can just put label safely.
                        If we had lucide icons for them, we'd render them here.
                        Checking config, they are strings 'mdi:...'. */}
                    <span className="font-medium">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
            <ToggleTheme type="inline" />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Socials</span>
            <div className="grid grid-cols-2 gap-2">
              {SOCIALS.map((social) => (
                <a
                  className="flex items-center gap-2 rounded-md border p-2 text-xs hover:bg-muted"
                  href={social.href}
                  key={social.name}
                  target="_blank"
                >
                  {social.name}
                  <ExternalLinkIcon className="ml-auto size-3 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
