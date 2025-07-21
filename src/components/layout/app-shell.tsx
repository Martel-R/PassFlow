
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
  useSidebar,
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
  Building,
  Ticket,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useInitializeStore, usePassFlowActions, useSession, useOrganizationName } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";


function AppHeader({ className, ...props }: React.ComponentProps<"header">) {
  const { isMobile, open, setOpen, openMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();
  const { clearSession } = usePassFlowActions();

  const handleLogout = async () => {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (res.ok) {
      clearSession();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      router.push('/');
      router.refresh();
    }
  };

  const showTrigger = (isMobile && !openMobile) || (!isMobile && !open);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 justify-between",
        className
      )}
      {...props}
    >
      <div>
        {showTrigger && <SidebarTrigger />}
      </div>
      <div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
}


export function AppShell({ 
    children, 
    organizationName, 
    organizationLogo 
}: { 
    children: React.ReactNode, 
    organizationName?: string | null,
    organizationLogo?: string | null,
}) {
  const pathname = usePathname();
  useInitializeStore({ organizationName, organizationLogo }); 
  const session = useSession();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };
  
  const noShellRoutes = ["/", "/get-ticket", "/display"];
  const showShell = !noShellRoutes.includes(pathname);

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Logo organizationName={organizationName} organizationLogo={organizationLogo} />
             {/* The trigger is now in AppHeader, but we keep one here for desktop view */}
            <div className="hidden md:block">
                <SidebarTrigger />
            </div>
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
                isActive={isActive("/get-ticket")}
                tooltip="Seleção de Senha"
              >
                <Link href="/get-ticket">
                  <Ticket />
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
            {session?.role === 'admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin")}
                  tooltip="Administração"
                >
                  <Link href="/admin">
                    <Settings />
                    <span>Administração</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
