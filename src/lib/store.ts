
"use client";

import { create } from 'zustand';
import { Ticket } from './types';
import { mockTickets, mockCounters } from './mock-data';

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
    setTickets: (tickets: Ticket[]) => void;
    callTicket: (ticket: Ticket, counterName: string) => void;
  };
};

export const usePassFlowStore = create<PassFlowState>((set, get) => ({
  tickets: mockTickets,
  calledTicket: null,
  callHistory: [],
  actions: {
    setTickets: (tickets) => set({ tickets }),
    callTicket: (ticket, counterName) => {
      const newCall: CalledTicket = {
        number: ticket.number,
        counter: counterName,
        timestamp: Date.now(),
      };
      set((state) => ({
        calledTicket: newCall,
        callHistory: [newCall, ...state.callHistory].slice(0, 5),
      }));
    },
  },
}));

export const useTickets = () => usePassFlowStore((state) => state.tickets);
export const useCalledTicket = () => usePassFlowStore((state) => state.calledTicket);
export const useCallHistory = () => usePassFlowStore((state) => state.callHistory);
export const usePassFlowActions = () => usePassFlowStore((state) => state.actions);
