
"use client";

import { create } from 'zustand';
import { Ticket } from './types';
import { getTickets } from './db';
import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';

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

// Hook to get session data from cookie
export function useSession() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        const cookie = Cookies.get('auth-session');
        if (cookie) {
            try {
                setSession(JSON.parse(cookie));
            } catch (e) {
                console.error("Failed to parse session cookie", e);
                setSession(null);
            }
        }
    }, []);

    return session;
}


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
    initialize: () => Promise<void>;
    refreshTickets: () => Promise<void>;
    callTicket: (ticket: Ticket, counterName: string) => void;
  };
};

const usePassFlowStore = create<PassFlowState>((set, get) => ({
  tickets: [],
  calledTicket: null,
  callHistory: [],
  actions: {
    initialize: async () => {
        try {
            const tickets = await getTickets();
            set({ tickets });
        } catch (error) {
            console.error("Failed to initialize store with DB data:", error);
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
  },
}));

export const useTickets = () => usePassFlowStore((state) => state.tickets);
export const useCalledTicket = () => usePassFlowStore((state) => state.calledTicket);
export const useCallHistory = () => usePassFlowStore((state) => state.callHistory);
export const usePassFlowActions = () => usePassFlowStore((state) => state.actions);
