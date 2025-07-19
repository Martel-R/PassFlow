
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Play,
  CheckCircle,
  Users,
  Clock,
  Tag
} from "lucide-react";
import { getCounterById, getServiceById, finalizeTicket, updateTicketStatus } from "@/lib/db";
import { Ticket, Counter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTickets, usePassFlowActions, useSession } from "@/lib/store";

export function ClerkDashboard() {
  const tickets = useTickets();
  const session = useSession();
  const { callTicket, refreshTickets } = usePassFlowActions();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isFinalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [clerkCounter, setClerkCounter] = useState<Counter | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCounter = async () => {
      if (session?.counterId) {
        const counter = await getCounterById(session.counterId);
        setClerkCounter(counter);
      } else if (session?.role === 'admin') {
         // Admin can operate as a generic counter for testing
         const counter = await getCounterById("1");
         setClerkCounter(counter);
      }
    };
    if (session) {
      fetchCounter();
    }
  }, [session]);

  const waitingTickets = useMemo(() => tickets.filter(t => t.status === 'waiting').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()), [tickets]);

  const handleCallNext = async () => {
    if (activeTicket && activeTicket.status !== 'finished') {
        toast({
            title: "Atendimento em andamento",
            description: "Finalize o atendimento atual antes de chamar o próximo.",
            variant: "destructive"
        });
        return;
    }
    
    if (!clerkCounter) {
        toast({ title: "Erro", description: "Balcão do atendente não configurado.", variant: "destructive" });
        return;
    }

    const services = await Promise.all(waitingTickets.map(t => getServiceById(t.serviceId || '')));
    
    const nextTicket = [...waitingTickets]
        .map((ticket, index) => ({ ticket, service: services[index] }))
        .filter(({ service }) => service !== null)
        .sort((a, b) => {
             if (!a.service || !b.service) return 0;
             if (a.service.category === 'priority' && b.service.category !== 'priority') return -1;
             if (a.service.category !== 'priority' && b.service.category === 'priority') return 1;
             return a.ticket.timestamp.getTime() - b.ticket.timestamp.getTime();
        })
        .find(({ service }) => {
            if (!service) return false;
            return clerkCounter.assignedCategories.includes(service.category);
        })?.ticket;

    if (nextTicket) {
      const updatedTicket = { ...nextTicket, status: 'in-progress' as const, counter: clerkCounter.name };
      setActiveTicket(updatedTicket);
      
      await updateTicketStatus(nextTicket.id, 'in-progress', clerkCounter.id);
      callTicket(updatedTicket, clerkCounter.name);
      await refreshTickets();

      toast({
        title: "Chamando senha",
        description: `Senha ${nextTicket.number} chamada para o ${clerkCounter.name}.`,
      });
    } else {
      toast({
        title: "Fila vazia",
        description: "Não há senhas aguardando na sua fila.",
      });
    }
  };

  const handleRecall = () => {
    if (activeTicket && clerkCounter) {
      callTicket(activeTicket, clerkCounter.name);
      toast({
        title: "Rechamando Senha",
        description: `Senha ${activeTicket.number} rechamada para o ${clerkCounter.name}.`,
      });
    }
  };
  
  const handleStartService = () => {
      if (activeTicket) {
        toast({
            title: "Atendimento Iniciado",
            description: `Iniciado atendimento para a senha ${activeTicket.number}.`
        });
      }
  };

  const openFinalizeModal = () => {
    if (activeTicket) {
        setFinalizeModalOpen(true);
    }
  };

  const handleFinalizeService = async () => {
    if (activeTicket) {
      const ticketTags = tags.split(",").map(t => t.trim()).filter(Boolean);
      await finalizeTicket(activeTicket.id, notes, ticketTags);
      
      await refreshTickets();

      setActiveTicket(null);
      setFinalizeModalOpen(false);
      setNotes("");
      setTags("");
      toast({
        title: "Atendimento Finalizado",
        description: `Atendimento da senha ${activeTicket.number} foi concluído.`,
      });
    }
  };

  if (!clerkCounter) {
    return <div>Carregando informações do atendente...</div>
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel do Atendente</h2>
          <p className="text-muted-foreground">
            {session?.name || 'Atendente'} - {clerkCounter.name}.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCallNext}>
            <Bell className="mr-2 h-4 w-4" /> Chamar Próximo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Fila de Espera</CardTitle>
            <CardDescription>
              {waitingTickets.length} senha(s) aguardando atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Senha</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Tempo de Espera</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitingTickets.length > 0 ? (
                      waitingTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.number}</TableCell>
                          <TableCell>{ticket.serviceName}</TableCell>
                          <TableCell>{formatDistanceToNow(ticket.timestamp, { addSuffix: true, locale: ptBR })}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          Nenhuma senha na fila.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Atendimento Atual</CardTitle>
            <CardDescription>
              Gerencie o atendimento em andamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-48">
            {activeTicket ? (
              <div className="text-center">
                <p className="text-6xl font-bold text-primary">{activeTicket.number}</p>
                <p className="text-muted-foreground">{activeTicket.serviceName}</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Nenhum atendimento ativo.</p>
                <p>Clique em "Chamar Próximo".</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleRecall} disabled={!activeTicket || activeTicket.status === 'finished'}>
              <Bell className="mr-2 h-4 w-4" /> Rechamada
            </Button>
            <div className="flex gap-2">
             <Button variant="outline" onClick={handleStartService} disabled={!activeTicket || activeTicket.status === 'finished'}>
                <Play className="mr-2 h-4 w-4" /> Iniciar
            </Button>
            <Button onClick={openFinalizeModal} disabled={!activeTicket || activeTicket.status === 'finished'}>
              <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
            </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Dialog open={isFinalizeModalOpen} onOpenChange={setFinalizeModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Finalizar Atendimento: {activeTicket?.number}</DialogTitle>
                <DialogDescription>Adicione observações e tags para este atendimento.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <label htmlFor="notes" className="flex items-center gap-2"><Clock /> Observações</label>
                    <Textarea id="notes" placeholder="Digite as observações do atendimento..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="tags" className="flex items-center gap-2"><Tag /> Tags</label>
                    <Input id="tags" placeholder="Ex: problema_resolvido, cliente_satisfeito" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <p className="text-sm text-muted-foreground">Separe as tags por vírgula.</p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setFinalizeModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleFinalizeService}>Confirmar Finalização</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
