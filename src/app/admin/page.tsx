
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Ticket,
  Users,
  LayoutGrid,
  Palette,
  RotateCcw,
  ArrowRight,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { resetTickets } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { usePassFlowActions } from "@/lib/store";


const adminActions = [
  {
    title: "Gerenciar Usuários",
    description: "Criar, editar e remover usuários.",
    icon: <UserCog className="h-6 w-6" />,
    href: "/admin/users",
  },
  {
    title: "Gerenciar Serviços",
    description: "Criar, editar e remover tipos de serviço.",
    icon: <Ticket className="h-6 w-6" />,
    href: "/admin/services",
  },
  {
    title: "Gerenciar Balcões",
    description: "Configurar os balcões de atendimento disponíveis.",
    icon: <Users className="h-6 w-6" />,
    href: "/admin/counters",
  },
  {
    title: "Gerenciar Categorias",
    description: "Definir categorias de serviço e prioridades.",
    icon: <LayoutGrid className="h-6 w-6" />,
    href: "/admin/categories",
  },
];

export default function AdminPage() {
  const { toast } = useToast();
  const { refreshTickets } = usePassFlowActions();

  const handleResetTickets = async () => {
    try {
      const { count } = await resetTickets();
      await refreshTickets();
      toast({
        title: "Senhas Zeradas com Sucesso!",
        description: `${count} senha(s) em espera foram canceladas. A contagem para novas senhas foi reiniciada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao zerar senhas",
        description: "Ocorreu um problema ao tentar zerar as senhas.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Administração</h2>
          <p className="text-muted-foreground">
            Configure e gerencie o sistema.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminActions.map((action) => (
          <Link href={action.href} key={action.title}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {action.title}
                </CardTitle>
                <div className="text-primary">{action.icon}</div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end">
                 <ArrowRight className="h-5 w-5 text-muted-foreground"/>
              </div>
            </Card>
          </Link>
        ))}
         <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette/> Branding Personalizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ajuste as cores e o logo para se adequar à sua marca.
            </p>
            <Button>Configurar Branding</Button>
          </CardContent>
        </Card>
         <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><RotateCcw/> Zerar Senhas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Esta ação cancela todas as senhas em espera. Use com cuidado.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Zerar Todas as Senhas</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá marcar todas as senhas em espera e em andamento como 'canceladas'.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleResetTickets}>Sim, zerar senhas</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
