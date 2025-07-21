
"use client";

import React from 'react';
import type { Ticket, Service } from '@/lib/types';
import { useOrganizationName } from '@/lib/store';

interface PrintableTicketProps {
  ticket: Ticket | null;
  service: Service | null;
}

export const PrintableTicket = React.forwardRef<HTMLDivElement, PrintableTicketProps>(
  ({ ticket, service }, ref) => {
    const organizationName = useOrganizationName();

    if (!ticket || !service) return null;

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(ticket.timestamp);

    return (
      <div ref={ref} id="printable-ticket" className="p-4 bg-white text-black font-mono">
        <div className="text-center space-y-4">
          <h1 className="text-lg font-bold">{organizationName || 'Sistema de Atendimento'}</h1>
          <div className="border-t border-b border-dashed border-black py-4 my-4">
            <p className="text-xl">Sua Senha:</p>
            <p className="text-6xl font-bold my-2">{ticket.number}</p>
          </div>
          <div>
            <p className="text-base font-semibold">{service.name}</p>
            <p className="text-sm">{formattedDate}</p>
          </div>
          <p className="text-xs pt-4">Aguarde e será chamado.</p>
        </div>
      </div>
    );
  }
);

PrintableTicket.displayName = 'PrintableTicket';
