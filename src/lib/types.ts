export type Service = {
  id: string;
  name: string;
  category: "priority" | "general";
  prefix: string;
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

export type TicketStatus = "waiting" | "in-progress" | "finished";

export type Ticket = {
  id: string;
  number: string;
  serviceName: string;
  serviceId?: string; // To link back to the service
  timestamp: Date;
  status: TicketStatus;
  counter?: string;
  counterId?: string;
  clerk?: string;
  notes?: string;
  tags?: string[];
};
