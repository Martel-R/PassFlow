"use client";

import { useState } from "react";
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
import { mockServices } from "@/lib/mock-data";
import { Ticket, ArrowRight, UserCheck, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const serviceIcons = {
  priority: <UserCheck className="h-8 w-8 text-primary" />,
  general: <Briefcase className="h-8 w-8 text-primary" />,
};

export function TicketSelection() {
  const [selectedService, setSelectedService] = useState<
    typeof mockServices[0] | null
  >(null);
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);
  const { toast } = useToast();

  const handleServiceClick = (service: typeof mockServices[0]) => {
    setSelectedService(service);
    const newTicketNumber = `${service.prefix}-${String(
      Math.floor(Math.random() * 900) + 100
    ).padStart(3, "0")}`;
    setGeneratedTicket(newTicketNumber);

    toast({
      title: "Senha gerada com sucesso!",
      description: `Sua senha é ${newTicketNumber}.`,
    });
  };

  const handleCloseDialog = () => {
    setSelectedService(null);
    setGeneratedTicket(null);
  };

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo ao PassFlow!</h2>
          <p className="text-muted-foreground">
            Selecione o serviço desejado para retirar sua senha.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockServices.map((service) => (
          <Card
            key={service.id}
            className="flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => handleServiceClick(service)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  {serviceIcons[service.category]}
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

      <Dialog open={!!generatedTicket} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Ticket className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Senha Gerada!</DialogTitle>
            <DialogDescription>
              Aguarde para ser chamado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-5xl font-bold text-primary">{generatedTicket}</p>
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
