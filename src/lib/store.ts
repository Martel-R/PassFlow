
"use client";

import { create } from 'zustand';
import { Ticket } from './types';
import { getTickets } from './db';

export interface Session {
    userId: string;
    name: string;
    role: 'admin' | 'clerk';
    counterId?: string;
}

interface InitializeParams {
    organizationName?: string | null;
    organizationLogo?: string | null;
    initialSession?: Session | null;
}

// Hook to get organization name from store
export const useOrganizationName = () => usePassFlowStore((state) => state.organizationName);

// Hook to get organization logo from store
export const useOrganizationLogo = () => usePassFlowStore((state) => state.organizationLogo);


type PassFlowState = {
  tickets: Ticket[];
  session: Session | null;
  organizationName: string | null;
  organizationLogo: string | null;
  actions: {
    initialize: (params: InitializeParams) => Promise<void>;
    refreshTickets: () => Promise<void>;
    setSession: (session: Session | null) => void;
    clearSession: () => void;
  };
};

export const usePassFlowStore = create<PassFlowState>((set, get) => ({
  tickets: [],
  session: null,
  organizationName: null,
  organizationLogo: null,
  actions: {
    initialize: async ({ organizationName, organizationLogo, initialSession = null }) => {
        try {
            const tickets = await getTickets();
            set({ 
                tickets, 
                organizationName: organizationName || null, 
                organizationLogo: organizationLogo || null,
                session: initialSession
            });
        } catch (error) {
            console.error("Failed to initialize store:", error);
            set({ 
                organizationName: organizationName || null, 
                organizationLogo: organizationLogo || null,
                session: initialSession
            });
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
    setSession: (session) => set({ session }),
    clearSession: () => set({ session: null }),
  },
}));

export const usePassFlowActions = () => usePassFlowStore((state) => state.actions);
