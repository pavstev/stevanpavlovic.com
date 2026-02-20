"use client";

import { AppSidebar } from "@components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@components/ui/sidebar";
import { type FC, type ReactNode } from "react";

import BrowserAiChat from "../custom/ai-chat/browser-ai-chat";

interface MainLayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children, header }) => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      {header}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </SidebarInset>
    <BrowserAiChat />
  </SidebarProvider>
);
