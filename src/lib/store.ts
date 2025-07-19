
"use client";

import { create } from 'zustand';
import { Ticket } from './types';
import { mockTickets } from './mock-data';
import { useEffect, useRef } from 'react';

// This custom hook ensures that the store is initialized only once
export function useInitializeStore() {
    const { initialize } = usePassFlowActions();
    const initialized = useRef(false);
    useEffect(() => {
        if (!initialized.current) {
            initialize();
            initialized.current = true;
        }
    }, [initialize]);
};

export type CalledTicket = {
  number: string;
  counter: string;
  timestamp: number;
};

type PassFlowState = {
  hydrated: boolean;
  tickets: Ticket[];
  calledTicket: CalledTicket | null;
  callHistory: CalledTicket[];
  actions: {
    initialize: () => void;
    addTicket: (ticket: Ticket) => void;
    updateTicket: (ticket: Ticket) => void;
    callTicket: (ticket: Ticket, counterName: string) => void;
  };
};

const usePassFlowStore = create<PassFlowState>((set, get) => ({
  hydrated: false,
  tickets: [],
  calledTicket: null,
  callHistory: [],
  actions: {
    initialize: () => {
        if (!get().hydrated) {
            set({ tickets: mockTickets, hydrated: true });
        }
    },
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
        callHistory: (state.calledTicket?.number !== newCall.number || state.calledTicket?.counter !== newCall.counter)
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
