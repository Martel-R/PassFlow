"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "./logo";
import {
  Home,
  Users,
  Settings,
  MonitorPlay,
  LogOut,
  Building,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Logo />
            <SidebarTrigger />
          </div>
          <Select defaultValue="unidade1">
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Selecionar unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unidade1">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Unidade Principal</span>
                </div>
              </SelectItem>
              <SelectItem value="unidade2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Filial Centro</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/")}
                tooltip="Seleção de Senha"
              >
                <Link href="/">
                  <Home />
                  <span>Seleção de Senha</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/clerk")}
                tooltip="Painel do Atendente"
              >
                <Link href="/clerk">
                  <Users />
                  <span>Painel do Atendente</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/display")}
                tooltip="Tela de Exibição"
              >
                <Link href="/display">
                  <MonitorPlay />
                  <span>Tela de Exibição</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin")}
                tooltip="Administração"
              >
                <Link href="/admin">
                  <Settings />
                  <span>Administração</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
