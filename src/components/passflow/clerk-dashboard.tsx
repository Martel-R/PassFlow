
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Play,
  CheckCircle,
  Users,
  Clock,
  Tag,
  ChevronDown,
  Circle,
  LogOut,
  Wifi,
  WifiOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCounterById, finalizeTicket, updateTicketStatus, getServicesForCounter, getUserById, updateUserStatus } from "@/lib/db";
import { Ticket, Counter, Service, ClerkStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTickets, usePassFlowActions, usePassFlowStore } from "@/lib/store";


function StatusSelector({ userId, onStatusChange }: { userId: string, onStatusChange: () => void }) {
    const [userStatus, setUserStatus] = useState<ClerkStatus>('online');
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [isModalOpen, setModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchStatus() {
            const user = await getUserById(userId);
            if (user) {
                setUserStatus(user.status);
                setStatusMessage(user.statusMessage || "");
            }
        }
        fetchStatus();
    }, [userId]);

    const handleSave = async () => {
        await updateUserStatus(userId, userStatus, statusMessage);
        toast({ title: "Status atualizado!" });
        setModalOpen(false);
        onStatusChange();
    };

    const openModalWithStatus = (status: ClerkStatus) => {
        setUserStatus(status);
        if (status === 'online') {
            setStatusMessage("");
            updateUserStatus(userId, 'online', null).then(() => {
                toast({ title: "Status atualizado para Online!" });
                onStatusChange();
            });
        } else {
            setModalOpen(true);
        }
    };

    const statusConfig = {
        online: { icon: Wifi, label: "Online", color: "text-green-500" },
        away: { icon: WifiOff, label: "Ausente", color: "text-red-500" },
    };
    
    const CurrentIcon = statusConfig[userStatus].icon;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                         <CurrentIcon className={`mr-2 h-4 w-4 ${statusConfig[userStatus].color}`} />
                         {statusConfig[userStatus].label}
                         <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Definir meu status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openModalWithStatus('online')}>
                        <Wifi className="mr-2 h-4 w-4 text-green-500" />
                        <span>Online</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModalWithStatus('away')}>
                        <WifiOff className="mr-2 h-4 w-4 text-red-500" />
                        <span>Ausente</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Definir status como "Ausente"</DialogTitle>
                        <DialogDescription>Deixe uma mensagem para que os administradores saibam o motivo.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="statusMessage">Mensagem de ausência (opcional)</Label>
                        <Input 
                            id="statusMessage"
                            value={statusMessage}
                            onChange={(e) => setStatusMessage(e.target.value)}
                            placeholder="Ex: Em pausa para o almoço"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}


export function ClerkDashboard() {
  const tickets = useTickets();
  const session = usePassFlowStore((state) => state.session);
  const { callTicket, refreshTickets } = usePassFlowActions();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isFinalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [clerkCounter, setClerkCounter] = useState<Counter | null>(null);
  const [clerkStatus, setClerkStatus] = useState<ClerkStatus>('online');
  const { toast } = useToast();
  
  const [serviceStartTime, setServiceStartTime] = useState<number | null>(null);
  const [serviceDuration, setServiceDuration] = useState<number>(0);
  
  // Fetch initial data on component mount
  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const fetchClerkData = async () => {
    if (session) {
      const user = await getUserById(session.userId);
       if (user?.counterId) {
            const counter = await getCounterById(user.counterId);
            setClerkCounter(counter);
        }
        if (user) {
            setClerkStatus(user.status);
        }
    }
  };

  useEffect(() => {
    fetchClerkData();
  }, [session]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (serviceStartTime) {
      timer = setInterval(() => {
        setServiceDuration(Math.floor((Date.now() - serviceStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [serviceStartTime]);

  const waitingTickets = useMemo(() => tickets.filter(t => t.status === 'waiting'), [tickets]);

  const resetServiceTimer = () => {
    setServiceStartTime(null);
    setServiceDuration(0);
  };

  const handleCallNext = async () => {
    if (clerkStatus === 'away') {
        toast({ title: "Você está ausente", description: "Mude seu status para 'Online' para chamar senhas.", variant: "destructive" });
        return;
    }
    if (activeTicket && activeTicket.status !== 'finished') {
        toast({
            title: "Atendimento em andamento",
            description: "Finalize o atendimento atual antes de chamar o próximo.",
            variant: "destructive"
        });
        return;
    }
    
    if (!clerkCounter) {
        toast({ title: "Erro", description: "Usuário não está associado a um balcão.", variant: "destructive" });
        return;
    }

    // Get all services this counter can attend to
    const availableServices = await getServicesForCounter(clerkCounter.id);
    const availableServiceIds = new Set(availableServices.map(s => s.id));

    const nextTicket = waitingTickets
        .filter(ticket => availableServiceIds.has(ticket.serviceId || '')) // Filter tickets clerk can attend
        .sort((a, b) => {
           // Higher priorityWeight first
           if (a.priorityWeight !== b.priorityWeight) {
                return b.priorityWeight - a.priorityWeight;
           }
            // Otherwise, sort by timestamp (older first)
            return a.timestamp.getTime() - b.timestamp.getTime();
        })
        .find(ticket => ticket); // Find the first one in the sorted list

    if (nextTicket && session) {
      resetServiceTimer();
      const updatedTicket = { ...nextTicket, status: 'in-progress' as const, counter: clerkCounter.name };
      setActiveTicket(updatedTicket);
      
      await updateTicketStatus(nextTicket.id, 'in-progress', clerkCounter.id, session.userId);
      callTicket(updatedTicket, clerkCounter.name);
      await refreshTickets(true); // pass true to notify other tabs

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
      if (activeTicket && !serviceStartTime) {
        setServiceStartTime(Date.now());
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
      
      await refreshTickets(true); // pass true to notify other tabs

      setActiveTicket(null);
      resetServiceTimer();
      setFinalizeModalOpen(false);
      setNotes("");
      setTags("");
      toast({
        title: "Atendimento Finalizado",
        description: `Atendimento da senha ${activeTicket.number} foi concluído.`,
      });
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (!session) {
      return (
        <div className="flex items-center justify-center h-full">
            <p>Carregando sessão...</p>
        </div>
      )
  }

  if (!clerkCounter) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-lg font-semibold">Nenhum balcão associado.</p>
            <p className="text-muted-foreground">Para usar o painel, seu usuário precisa estar associado a um balcão.</p>
            {session.role === 'admin' && (
              <p className="text-sm text-muted-foreground mt-2">Vá para <a href="/admin/users" className="underline text-primary">Gerenciar Usuários</a> para associar um balcão.</p>
            )}
        </div>
    )
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
          <StatusSelector userId={session.userId} onStatusChange={fetchClerkData} />
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
                          <TableCell className="font-medium">
                             <Badge variant={ticket.priorityWeight > 1 ? 'default' : 'secondary'}>{ticket.number}</Badge>
                          </TableCell>
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
                {serviceStartTime && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-lg font-mono text-foreground">
                    <Clock className="h-5 w-5" />
                    <span>{formatDuration(serviceDuration)}</span>
                  </div>
                )}
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
             {!serviceStartTime ? (
                 <Button 
                    variant="outline" 
                    onClick={handleStartService} 
                    disabled={!activeTicket || activeTicket.status === 'finished'}
                 >
                    <Play className="mr-2 h-4 w-4" /> Iniciar
                </Button>
             ) : (
                <Button 
                    onClick={openFinalizeModal} 
                    disabled={!activeTicket || activeTicket.status === 'finished'}
                >
                    <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
                </Button>
             )}
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
                    <Label htmlFor="notes" className="flex items-center gap-2"><Clock /> Observações</Label>
                    <Textarea id="notes" placeholder="Digite as observações do atendimento..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="tags" className="flex items-center gap-2"><Tag /> Tags</Label>
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
