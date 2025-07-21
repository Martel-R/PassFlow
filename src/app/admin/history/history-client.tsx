
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceStrict, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TicketHistoryEntry } from "@/lib/types";


interface HistoryClientProps {
  history: TicketHistoryEntry[];
}

const formatDuration = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return formatDistanceStrict(0, seconds * 1000, { locale: ptBR, unit: 'minute' });
};


export function HistoryClient({ history }: HistoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(
    (ticket) =>
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.clerkName && ticket.clerkName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.notes && ticket.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.tags && ticket.tags.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atendimentos</CardTitle>
        <CardDescription>
          Visualize todos os atendimentos finalizados no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Buscar por senha, serviço, atendente, notas ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Senha</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Atendente</TableHead>
                <TableHead>Data/Hora Finalização</TableHead>
                <TableHead>Tempo de Espera</TableHead>
                <TableHead>Tempo de Atendimento</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.number}</TableCell>
                    <TableCell>{ticket.serviceName}</TableCell>
                    <TableCell>{ticket.clerkName || "N/A"}</TableCell>
                    <TableCell>
                      {ticket.finishedTimestamp ? format(new Date(ticket.finishedTimestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 'N/A'}
                    </TableCell>
                    <TableCell>{formatDuration(ticket.waitTime)}</TableCell>
                    <TableCell>{formatDuration(ticket.serviceTime)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{ticket.notes || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ticket.tags && ticket.tags.split(',').filter(Boolean).map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
