

export type Service = {
  id: string;
  name: string;
  categoryId: string;
};

export type Counter = {
  id: string;
  name: string;
  assignedCategories: string[];
};

export type Category = {
  id: string;
  name: string;
};

export type TicketType = {
  id: string;
  name: string;
  description: string;
  prefix: string;
  priorityWeight: number; // Higher number = higher priority
};

export type TicketStatus = "waiting" | "in-progress" | "finished" | "cancelled";

export type Ticket = {
  id: string;
  number: string;
  serviceName: string;
  serviceId: string;
  timestamp: Date;
  status: TicketStatus;
  priorityWeight: number;
  counter?: string;
  counterId?: string;
  clerk?: string;
  notes?: string;
  tags?: string[];
};

export type User = {
    id: string;
    name: string;
    username: string;
    password?: string; // Not ideal for production, but okay for a prototype
    role: 'admin' | 'clerk';
    counter_id?: string;
    counterName?: string;
};
