
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getServices, addTicket as dbAddTicket, getCategories } from "@/lib/db";
import { Ticket as TicketIcon, ArrowRight, UserCheck, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePassFlowActions } from "@/lib/store";
import type { Service, Ticket, Category } from "@/lib/types";

const serviceIcons: Record<string, React.ReactNode> = {
  priority: <UserCheck className="h-8 w-8 text-primary" />,
  general: <Briefcase className="h-8 w-8 text-primary" />,
};

export function TicketSelection() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();
  const { refreshTickets } = usePassFlowActions();

  useEffect(() => {
    const fetchServices = async () => {
      const dbServices = await getServices();
      setServices(dbServices);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (generatedTicket) {
      timer = setTimeout(() => {
        handleCloseDialog();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [generatedTicket]);

  const handleServiceClick = async (service: Service) => {
    try {
      const newTicket = await dbAddTicket(service);
      setGeneratedTicket(newTicket);
      setSelectedService(service);
      await refreshTickets();

      toast({
        title: "Senha gerada com sucesso!",
        description: `Sua senha é ${newTicket.number}.`,
      });
    } catch (error) {
       toast({
        title: "Erro ao gerar senha",
        description: "Não foi possível gerar a senha. Tente novamente.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedService(null);
    setGeneratedTicket(null);
  };
  
  const getIconForCategory = (categoryId: string) => {
    // A simple logic to return a specific icon based on category name or id
    // This can be expanded with a more robust mapping.
    if (categoryId.includes('priority')) {
      return serviceIcons['priority'];
    }
    return serviceIcons['general'];
  }


  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Bem-vindo!</h2>
        <p className="text-muted-foreground">
          Selecione o serviço desejado para retirar sua senha.
        </p>
      </div>
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className="flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => handleServiceClick(service)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  {getIconForCategory(service.category)}
                  <CardTitle className="mt-4">{service.name}</CardTitle>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clique aqui para obter uma senha para {service.name.toLowerCase()}.
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!generatedTicket} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <TicketIcon className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Senha Gerada!</DialogTitle>
            <DialogDescription>
              Aguarde para ser chamado. Este aviso fechará automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-5xl font-bold text-primary">{generatedTicket?.number}</p>
            <p className="text-muted-foreground mt-2">{selectedService?.name}</p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={handleCloseDialog}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
