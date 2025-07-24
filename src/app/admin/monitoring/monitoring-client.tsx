
"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Clock, Timer } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LiveClerkState, ClerkPerformanceStats } from "@/lib/types";

interface MonitoringClientProps {
    initialLiveState: LiveClerkState[];
    initialPerformanceStats: ClerkPerformanceStats[];
    getStatsAction: (period: string) => Promise<ClerkPerformanceStats[]>;
}

export function MonitoringClient({ 
    initialLiveState,
    initialPerformanceStats,
    getStatsAction
}: MonitoringClientProps) {
    const [liveState, setLiveState] = useState(initialLiveState);
    const [performanceStats, setPerformanceStats] = useState(initialPerformanceStats);
    const [isPending, startTransition] = useTransition();

    // This effect can be used later to implement live updates via websockets or polling
    useEffect(() => {
        setLiveState(initialLiveState);
    }, [initialLiveState]);

    const handlePeriodChange = (period: string) => {
        startTransition(async () => {
            const newStats = await getStatsAction(period);
            setPerformanceStats(newStats);
        });
    };

    const formatDuration = (seconds: number) => {
        if (isNaN(seconds) || seconds < 0) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        if (minutes < 1) return `${remainingSeconds}s`;
        return `${minutes}m ${remainingSeconds}s`;
    };
    
    const activeClerks = liveState.filter(s => s.status === 'in-progress');

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atendimentos em Andamento</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeClerks.length}</div>
                        <p className="text-xs text-muted-foreground">Senhas sendo atendidas agora</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atendentes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeClerks.length}</div>
                         <p className="text-xs text-muted-foreground">Atendentes com chamado ativo</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Status dos Atendentes (Ao Vivo)</CardTitle>
                    <CardDescription>
                        O que cada atendente está fazendo neste momento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Atendente</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Senha</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Balcão</TableHead>
                                <TableHead>Tempo no Atendimento</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {liveState.length > 0 ? liveState.map(clerk => (
                               <TableRow key={clerk.clerkId}>
                                   <TableCell className="font-medium">{clerk.clerkName}</TableCell>
                                   <TableCell>
                                        <Badge variant={clerk.status === 'in-progress' ? 'default' : 'secondary'}>
                                          {clerk.status === 'in-progress' ? 'Atendendo' : 'Livre'}
                                        </Badge>
                                   </TableCell>
                                   <TableCell>{clerk.ticketNumber || '-'}</TableCell>
                                   <TableCell>{clerk.serviceName || '-'}</TableCell>
                                   <TableCell>{clerk.counterName || 'N/A'}</TableCell>
                                   <TableCell>
                                    {clerk.calledTimestamp ? formatDistanceToNowStrict(new Date(clerk.calledTimestamp), { locale: ptBR }) : '-'}
                                   </TableCell>
                               </TableRow>
                           )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Nenhum atendente online ou disponível.
                                    </TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Performance dos Atendentes</CardTitle>
                            <CardDescription>
                                Total de atendimentos e tempo médio por período.
                            </CardDescription>
                        </div>
                        <Select onValueChange={handlePeriodChange} defaultValue="today">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hoje</SelectItem>
                                <SelectItem value="yesterday">Ontem</SelectItem>
                                <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                                <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                                <SelectItem value="all">Todo o período</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Atendente</TableHead>
                                <TableHead className="text-center"><Users className="inline-block mr-1 h-4 w-4" /> Atendimentos Finalizados</TableHead>
                                <TableHead className="text-center"><Timer className="inline-block mr-1 h-4 w-4" /> Tempo Médio de Atendimento</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {isPending ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Carregando estatísticas...
                                    </TableCell>
                                </TableRow>
                           ) : performanceStats.length > 0 ? performanceStats.map(stat => (
                               <TableRow key={stat.clerkId}>
                                   <TableCell className="font-medium">{stat.clerkName}</TableCell>
                                   <TableCell className="text-center">{stat.totalFinished}</TableCell>
                                   <TableCell className="text-center">{formatDuration(stat.avgServiceTimeSeconds)}</TableCell>
                               </TableRow>
                           )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Nenhum dado de performance para o período selecionado.
                                    </TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
