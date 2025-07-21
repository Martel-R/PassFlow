

export type Service = {
  id: string;
  name: string;
  categoryId: string;
  icon: string;
};

export type Counter = {
  id: string;
  name: string;
  assignedCategories: string[];
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type TicketType = {
  id: string;
  name: string;
  description: string;
  prefix: string;
  priorityWeight: number; // Higher number = higher priority
  icon: string;
};

export type TicketStatus = "waiting" | "in-progress" | "finished" | "cancelled";

export type Ticket = {
  id: string;
  number: string;
  serviceName: string;
  serviceId: string;
  timestamp: Date; // Keep `timestamp` as the primary user-facing time for simplicity in components
  createdTimestamp?: Date;
  calledTimestamp?: Date;
  finishedTimestamp?: Date;
  status: TicketStatus;
  priorityWeight: number;
  counter?: string;
  counterId?: string;
  clerk?: string;
  clerkId?: string;
  notes?: string;
  tags?: string[];
};

export type User = {
    id: string;
    name: string;
    username: string;
    password?: string; // Not ideal for production, but okay for a prototype
    role: 'admin' | 'clerk';
    counterId?: string;
    counterName?: string;
};

export type AdvertisementMedia = {
    id: string;
    type: 'image' | 'video';
    src: string; // Data URI for image, URL for video
    duration?: number; // in seconds, only for images
}
