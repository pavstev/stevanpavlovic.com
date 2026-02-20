"use client";

import { SidebarInset, SidebarProvider } from "@components/ui/sidebar";
import { type FC, type ReactNode } from "react";

import BrowserAiChat from "../custom/ai-chat/browser-ai-chat";
import { AppSidebar } from "@components/layout/app-sidebar"; // Changed to alias
import { Header } from "@components/layout/header"; // Changed to alias

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Header />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </SidebarInset>
    <BrowserAiChat client:load />
  </SidebarProvider>
);
