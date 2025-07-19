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

export type Ticket = {
  id: string;
  number: string;
  serviceName: string;
  timestamp: Date;
  status: "waiting" | "in-progress" | "finished";
  counter?: string;
  clerk?: string;
  notes?: string;
  tags?: string[];
};
