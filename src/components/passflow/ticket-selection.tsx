
"use client";

import { useState, useEffect, useRef } from "react";
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
import { getServicesByCategory, getCategories, addTicket as dbAddTicket, getTicketTypes } from "@/lib/db";
import { Ticket as TicketIcon, ArrowRight, ChevronLeft, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePassFlowActions } from "@/lib/store";
import type { Service, Ticket, Category, TicketType } from "@/lib/types";
import { DynamicIcon } from "./dynamic-icon";
import { PrintableTicket } from "./printable-ticket";

type Step = 'category' | 'service' | 'type';

const stepTitles: Record<Step, { title: string; description: string }> = {
  category: {
    title: "Passo 1: Selecione a Categoria",
    description: "Escolha o tipo de atendimento que você precisa.",
  },
  service: {
    title: "Passo 2: Selecione o Serviço",
    description: "Escolha o serviço específico que você deseja.",
  },
  type: {
    title: "Passo 3: Selecione o Tipo de Senha",
    description: "Informe o seu tipo de atendimento.",
  }
};

export function TicketSelection() {
  const [step, setStep] = useState<Step>('category');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const { refreshTickets } = usePassFlowActions();
  const printableTicketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const dbCategories = await getCategories();
      setCategories(dbCategories);
      const dbTicketTypes = await getTicketTypes();
      setTicketTypes(dbTicketTypes);
    };
    fetchInitialData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCategoryClick = async (category: Category) => {
    const dbServices = await getServicesByCategory(category.id);
    setServices(dbServices);
    setSelectedCategory(category);
    setStep('service');
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setStep('type');
  };

  const handleTicketTypeClick = async (type: TicketType) => {
    if (!selectedService) return;

    try {
      const newTicket = await dbAddTicket(selectedService, type);
      setGeneratedTicket(newTicket);
      setIsDialogOpen(true);
      await refreshTickets(true);

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

  const handleBack = () => {
    if (step === 'type') {
      setStep('service');
    } else if (step === 'service') {
      setStep('category');
      setSelectedCategory(null);
      setServices([]);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setGeneratedTicket(null);
    // Reset state to the beginning
    setStep('category');
    setSelectedCategory(null);
    setSelectedService(null);
    setServices([]);
  };
  
  const renderStepContent = () => {
    switch(step) {
      case 'category':
        return (
          <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                     <DynamicIcon name={category.icon} className="h-8 w-8 text-primary" />
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                   <CardTitle className="mt-4">{category.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        );
      case 'service':
        return (
          <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.id}
                className="flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                onClick={() => handleServiceClick(service)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <DynamicIcon name={service.icon} className="h-8 w-8 text-primary" />
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{service.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        );
      case 'type':
        return (
           <div className="grid w-full max-w-2xl gap-8 md:grid-cols-2">
              {ticketTypes.map((type) => (
                <Card
                    key={type.id}
                    className="flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                    onClick={() => handleTicketTypeClick(type)}
                >
                    <CardHeader>
                    <div className="flex items-start justify-between">
                        <DynamicIcon name={type.icon} className="h-8 w-8 text-primary" />
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">{type.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>{type.description}</CardDescription>
                    </CardContent>
                </Card>
              ))}
           </div>
        );
    }
  }

  return (
    <>
      <div className="text-center mb-8 relative w-full max-w-4xl">
        {step !== 'category' && (
            <Button 
                variant="ghost" 
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2"
                onClick={handleBack}
            >
                <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
        )}
        <h2 className="text-3xl font-bold tracking-tight">{stepTitles[step].title}</h2>
        <p className="text-muted-foreground mt-2">
          {stepTitles[step].description}
        </p>
      </div>
      
      {renderStepContent()}

       <div className="hidden">
          <PrintableTicket
            ref={printableTicketRef}
            ticket={generatedTicket}
            service={selectedService}
          />
       </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <TicketIcon className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Senha Gerada!</DialogTitle>
            <DialogDescription>
              Aguarde para ser chamado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-5xl font-bold text-primary">{generatedTicket?.number}</p>
            <p className="text-muted-foreground mt-2">{selectedService?.name}</p>
          </div>
          <DialogFooter className="sm:justify-center flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Fechar
            </Button>
            <Button type="button" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
