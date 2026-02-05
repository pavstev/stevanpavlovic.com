"use client";

import { SidebarInset, SidebarProvider } from "@components/ui/sidebar";
import { type FC, type ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";

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
  </SidebarProvider>
);
