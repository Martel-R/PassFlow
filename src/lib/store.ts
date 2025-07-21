
"use client";

import { create } from 'zustand';
import { Ticket } from './types';
import { getTickets } from './db';
import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

interface Session {
    userId: string;
    name: string;
    role: 'admin' | 'clerk';
    counterId?: string;
}

interface InitializeParams {
    organizationName?: string | null;
    organizationLogo?: string | null;
}

// This custom hook ensures that the store is initialized only once
export function useInitializeStore({ organizationName, organizationLogo }: InitializeParams) {
    const { initialize } = usePassFlowActions();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialize({ organizationName, organizationLogo });
            initialized.current = true;
        }
    }, [initialize, organizationName, organizationLogo]);
};


// Hook to get session data from cookie
export function useSession() {
    return usePassFlowStore((state) => state.session);
}

// Hook to get organization name from store
export const useOrganizationName = () => usePassFlowStore((state) => state.organizationName);

// Hook to get organization logo from store
export const useOrganizationLogo = () => usePassFlowStore((state) => state.organizationLogo);


export type CalledTicket = {
  number: string;
  counter: string;
  timestamp: number;
};

type PassFlowState = {
  tickets: Ticket[];
  calledTicket: CalledTicket | null;
  callHistory: CalledTicket[];
  session: Session | null;
  organizationName: string | null;
  organizationLogo: string | null;
  actions: {
    initialize: (params: InitializeParams) => Promise<void>;
    refreshTickets: () => Promise<void>;
    callTicket: (ticket: Ticket, counterName: string) => void;
    setSession: (session: Session | null) => void;
    clearSession: () => void;
  };
};

const usePassFlowStore = create<PassFlowState>((set, get) => ({
  tickets: [],
  calledTicket: null,
  callHistory: [],
  session: null,
  organizationName: null,
  organizationLogo: null,
  actions: {
    initialize: async ({ organizationName, organizationLogo }) => {
        try {
            const tickets = await getTickets();
            const cookie = Cookies.get('auth-session');
            const session = cookie ? JSON.parse(cookie) : null;
            set({ tickets, session, organizationName: organizationName || null, organizationLogo: organizationLogo || null });
        } catch (error) {
            console.error("Failed to initialize store:", error);
            set({ organizationName: organizationName || null, organizationLogo: organizationLogo || null });
        }
    },
    refreshTickets: async () => {
        try {
            const tickets = await getTickets();
            set({ tickets });
        } catch (error) {
            console.error("Failed to refresh tickets from DB:", error);
        }
    },
    callTicket: (ticket, counterName) => {
      const newCall: CalledTicket = {
        number: ticket.number,
        counter: counterName,
        timestamp: Date.now(),
      };
      set((state) => ({
        calledTicket: newCall,
        callHistory: (state.calledTicket?.number !== newCall.number || state.calledTicket?.counter !== newCall.counter)
            ? [newCall, ...state.callHistory].slice(0, 10) 
            : state.callHistory,
      }));
    },
    setSession: (session) => set({ session }),
    clearSession: () => set({ session: null }),
  },
}));

export const useTickets = () => usePassFlowStore((state) => state.tickets);
export const useCalledTicket = () => usePassFlowStore((state) => state.calledTicket);
export const useCallHistory = () => usePassFlowStore((state) => state.callHistory);
export const usePassFlowActions = () => usePassFlowStore((state) => state.actions);
