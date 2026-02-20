"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Icon } from "@components/ui/icon";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@components/ui/sidebar";
import { type ComponentProps, type FC } from "react";

import { NAV_ITEMS_ARRAY, SITE_CONFIG, SOCIALS } from "../../constants";
import { ColorModeToggle } from "../custom/navigation/color-mode-toggle";
import { useCurrentPath, useIsActive } from "../custom/shared/hooks";

export const AppSidebar: FC<ComponentProps<typeof Sidebar>> = ({ ...props }) => {
  const pathname = useCurrentPath();

  return (
    <Sidebar collapsible="offcanvas" {...props} className="md:hidden">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <Avatar className="size-10 rounded-lg border">
            <AvatarImage alt={SITE_CONFIG.author} src={SITE_CONFIG.avatar.src} />
            <AvatarFallback className="rounded-lg">SP</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{SITE_CONFIG.author}</span>
            <span className="text-muted-foreground truncate text-xs">{SITE_CONFIG.headline}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS_ARRAY.map((item) => {
                const isActive = useIsActive(item.href, pathname);
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <a href={item.href}>
                        {item.icon && <Icon name={item.icon} />}
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs font-medium">Theme</span>
            <ColorModeToggle type="inline" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-medium">Socials</span>
            <div className="grid grid-cols-3 gap-2">
              {SOCIALS.map((social) => (
                <a
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center rounded-md border p-2"
                  href={social.href}
                  key={social.name}
                  target="_blank"
                  title={social.name}
                >
                  <Icon className="size-4" name={social.icon} />
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