
"use client";

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
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Ticket } from "@/lib/types";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, Users, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { formatDistanceStrict } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

interface AdminDashboardClientProps {
    metrics: any;
    recentTickets: any[];
}

export function AdminDashboardClient({ metrics, recentTickets }: AdminDashboardClientProps) {
    const formatDuration = (seconds: number) => {
        if (isNaN(seconds) || seconds < 0) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 1) return 'menos de 1 min';
        return formatDistanceStrict(0, seconds * 1000, { locale: ptBR });
    };

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Dashboard de Atendimento
                    </h2>
                    <p className="text-muted-foreground">
                        Visão geral e métricas do fluxo de atendimento.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Senhas Hoje</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.ticketsToday}</div>
                        <p className="text-xs text-muted-foreground">Total de senhas emitidas hoje</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio de Espera</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(metrics.avgWaitTimeSeconds)}</div>
                        <p className="text-xs text-muted-foreground">Média do dia de hoje</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio de Atendimento</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(metrics.avgServiceTimeSeconds)}</div>
                        <p className="text-xs text-muted-foreground">Média do dia de hoje</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Senhas em Espera</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.waitingNow}</div>
                        <p className="text-xs text-muted-foreground">Aguardando atendimento agora</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart2 /> Atendimentos na Semana</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                             <BarChart data={metrics.ticketsLast7Days}>
                                <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                />
                                <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    content={<ChartTooltipContent />}
                                    cursor={{ fill: "hsl(var(--muted))" }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-4 lg:col-span-3">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PieChartIcon /> Serviços Mais Utilizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={metrics.topServices} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                    {metrics.topServices.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Atendimentos Recentes</CardTitle>
                    <CardDescription>
                        As últimas 5 senhas finalizadas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Senha</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Atendente</TableHead>
                                <TableHead>Tempo de Espera</TableHead>
                                <TableHead>Tempo de Atendimento</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTickets.length > 0 ? recentTickets.map((ticket: any) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">{ticket.number}</TableCell>
                                    <TableCell>{ticket.serviceName}</TableCell>
                                    <TableCell>{ticket.clerkName || 'N/A'}</TableCell>
                                    <TableCell>{formatDuration(ticket.waitTime)}</TableCell>
                                    <TableCell>{formatDuration(ticket.serviceTime)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Nenhuma senha finalizada encontrada.
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
