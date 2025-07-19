
"use client";

import { create } from 'zustand';
import { Ticket } from './types';
import { mockTickets } from './mock-data';

export type CalledTicket = {
  number: string;
  counter: string;
  timestamp: number;
};

type PassFlowState = {
  tickets: Ticket[];
  calledTicket: CalledTicket | null;
  callHistory: CalledTicket[];
  actions: {
    addTicket: (ticket: Ticket) => void;
    updateTicket: (ticket: Ticket) => void;
    callTicket: (ticket: Ticket, counterName: string) => void;
  };
};

export const usePassFlowStore = create<PassFlowState>((set) => ({
  tickets: mockTickets,
  calledTicket: null,
  callHistory: [],
  actions: {
    addTicket: (ticket) => set((state) => ({ tickets: [...state.tickets, ticket] })),
    updateTicket: (ticket) => set((state) => ({
      tickets: state.tickets.map(t => t.id === ticket.id ? ticket : t)
    })),
    callTicket: (ticket, counterName) => {
      const newCall: CalledTicket = {
        number: ticket.number,
        counter: counterName,
        timestamp: Date.now(),
      };
      set((state) => ({
        calledTicket: newCall,
        // Add to history only if it's a new call or a different ticket
        callHistory: (state.calledTicket?.number !== newCall.number) 
            ? [newCall, ...state.callHistory].slice(0, 10) 
            : state.callHistory,
      }));
    },
  },
}));

export const useTickets = () => usePassFlowStore((state) => state.tickets);
export const useCalledTicket = () => usePassFlowStore((state) => state.calledTicket);
export const useCallHistory = () => usePassFlowStore((state) => state.callHistory);
export const usePassFlowActions = () => usePassFlowStore((state) => state.actions);
