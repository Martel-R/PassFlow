import type { Service, Counter, Category, Ticket } from "./types";

export const mockServices: Service[] = [
  { id: "1", name: "Abertura de Conta", category: "general", prefix: "G" },
  { id: "2", name: "Pagamento de Contas", category: "general", prefix: "G" },
  { id: "3", name: "Atendimento Prioritário", category: "priority", prefix: "P" },
  { id: "4", name: "Informações Gerais", category: "general", prefix: "G" },
  { id: "5", name: "Caixa Rápido", category: "priority", prefix: "P" },
];

export const mockCategories: Category[] = [
  { id: "general", name: "Atendimento Geral" },
  { id: "priority", name: "Atendimento Prioritário" },
];

export const mockCounters: Counter[] = [
  { id: "1", name: "Balcão 01", assignedCategories: ["general", "priority"] },
  { id: "2", name: "Balcão 02", assignedCategories: ["general"] },
  { id: "3", name: "Balcão 03", assignedCategories: ["general"] },
  { id: "4", name: "Balcão 04", assignedCategories: ["priority"] },
];

export const mockTickets: Ticket[] = [
  { id: "t1", number: "P-001", serviceName: "Atendimento Prioritário", timestamp: new Date(Date.now() - 5 * 60000), status: "waiting" },
  { id: "t2", number: "G-001", serviceName: "Abertura de Conta", timestamp: new Date(Date.now() - 4 * 60000), status: "waiting" },
  { id: "t3", number: "G-002", serviceName: "Pagamento de Contas", timestamp: new Date(Date.now() - 3 * 60000), status: "waiting" },
  { id: "t4", number: "P-002", serviceName: "Caixa Rápido", timestamp: new Date(Date.now() - 2 * 60000), status: "waiting" },
  { id: "t5", number: "G-003", serviceName: "Informações Gerais", timestamp: new Date(Date.now() - 1 * 60000), status: "waiting" },
];
