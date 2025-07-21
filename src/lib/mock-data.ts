
import type { Service, Counter, Category, User, TicketType } from "./types";

export const mockCategories: Category[] = [
  { id: "cat-1", name: "Atendimento Geral", icon: "Users" },
  { id: "cat-2", name: "Serviços de Caixa", icon: "Banknote" },
  { id: "cat-3", name: "Gerência", icon: "Briefcase" },
];

export const mockServices: Service[] = [
  { id: "1", name: "Abertura de Conta", categoryId: "cat-1", icon: "FilePlus" },
  { id: "2", name: "Informações e Consultas", categoryId: "cat-1", icon: "Info" },
  { id: "3", name: "Pagamento de Contas", categoryId: "cat-2", icon: "DollarSign" },
  { id: "4", name: "Depósitos e Saques", categoryId: "cat-2", icon: "Landmark" },
  { id: "5", name: "Falar com o Gerente", categoryId: "cat-3", icon: "User" },
];

export const mockCounters: Counter[] = [
  { id: "1", name: "Balcão 01", assignedCategories: ["cat-1", "cat-2", "cat-3"] },
  { id: "2", name: "Balcão 02", assignedCategories: ["cat-1"] },
  { id: "3", name: "Balcão 03", assignedCategories: ["cat-2"] },
  { id: "4", name: "Balcão 04", assignedCategories: ["cat-1", "cat-2"] },
];

export const mockUsers: User[] = [
    { id: "u1", name: "Admin Geral", username: "admin", password: "1234", role: "admin" },
    { id: "u2", name: "Ana Silva", username: "ana", password: "1234", role: "clerk", counterId: "1" },
    { id: "u3", name: "Bruno Costa", username: "bruno", password: "1234", role: "clerk", counterId: "2" },
    { id: "u4", name: "Carla Dias", username: "carla", password: "1234", role: "clerk", counterId: "4" },
];

export const mockTicketTypes: TicketType[] = [
    { id: "tt-1", name: "Atendimento Normal", description: "Para atendimento geral sem prioridade legal.", prefix: "G", priorityWeight: 1, icon: "User" },
    { id: "tt-2", name: "Atendimento Prioritário", description: "Para idosos, gestantes, pessoas com deficiência, etc.", prefix: "P", priorityWeight: 10, icon: "Heart" },
];
