"use client";

import { ColorModeToggle } from "@components/layout/color-mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Icon } from "@components/ui/icon";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import * as React from "react";

import { NAV_ITEMS_ARRAY, PROFILE, SOCIALS } from "../../config";

export type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar: React.FC<AppSidebarProps> = ({ ...props }) => {
  const [pathname, setPathname] = React.useState("");

  React.useEffect((): void => {
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
            <ColorModeToggle type="inline" />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Socials</span>
            <div className="grid grid-cols-2 gap-2">
              {SOCIALS.map((social) => (
                <TooltipProvider key={social.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        className="flex items-center gap-2 rounded-md border p-2 text-xs hover:bg-muted"
                        href={social.href}
                        target="_blank"
                      >
                        {social.name}
                        <Icon className="ml-auto size-3 opacity-50" name="mdi:open-in-new" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open {social.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
