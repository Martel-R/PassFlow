'use server';

import Database from 'better-sqlite3';
import {
  Category,
  Counter,
  Service,
  Ticket,
  TicketStatus,
} from '../types';
import { mockCategories, mockCounters, mockServices } from '../mock-data';

const db = new Database('passflow.db');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      prefix TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS counter_categories (
        counter_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        PRIMARY KEY (counter_id, category_id),
        FOREIGN KEY (counter_id) REFERENCES counters(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      service_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      status TEXT NOT NULL,
      counter_id TEXT,
      notes TEXT,
      tags TEXT,
      service_name TEXT,
      FOREIGN KEY (service_id) REFERENCES services (id),
      FOREIGN KEY (counter_id) REFERENCES counters (id)
    );
  `);

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
    mockCategories.forEach(cat => insertCategory.run(cat.id, cat.name));
  }

  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (serviceCount.count === 0) {
    const insertService = db.prepare('INSERT INTO services (id, name, category_id, prefix) VALUES (?, ?, ?, ?)');
    mockServices.forEach(srv => insertService.run(srv.id, srv.name, srv.category, srv.prefix));
  }
  
  const counterCount = db.prepare('SELECT COUNT(*) as count FROM counters').get() as { count: number };
    if (counterCount.count === 0) {
        const insertCounter = db.prepare('INSERT INTO counters (id, name) VALUES (?, ?)');
        const insertCounterCategory = db.prepare('INSERT INTO counter_categories (counter_id, category_id) VALUES (?, ?)');

        mockCounters.forEach(counter => {
            insertCounter.run(counter.id, counter.name);
            counter.assignedCategories.forEach(catId => {
                insertCounterCategory.run(counter.id, catId);
            });
        });
    }
}

// Check if 'service_name' column exists and add it if not
function migrateDb() {
    try {
        db.prepare('SELECT service_name FROM tickets LIMIT 1').get();
    } catch (e) {
        db.exec('ALTER TABLE tickets ADD COLUMN service_name TEXT');
    }
}


initDb();
migrateDb();

// Service Functions
export async function getServices(): Promise<Service[]> {
  const rows = db.prepare('SELECT s.id, s.name, s.prefix, s.category_id as category FROM services s').all() as any[];
  return rows;
}

// Category Functions
export async function getCategories(): Promise<Category[]> {
  const rows = db.prepare('SELECT id, name FROM categories').all() as any[];
  return rows;
}

// Counter Functions
export async function getCounters(): Promise<Counter[]> {
  const counters = db.prepare('SELECT id, name FROM counters').all() as any[];
  const stmt = db.prepare('SELECT category_id FROM counter_categories WHERE counter_id = ?');

  return counters.map(counter => {
    const assignedCategories = stmt.all(counter.id).map((row: any) => row.category_id);
    return { ...counter, assignedCategories };
  });
}

// Ticket Functions
export async function getTickets(): Promise<Ticket[]> {
    const rows = db.prepare(`
        SELECT 
            t.id, 
            t.number, 
            t.service_name as serviceName, 
            t.timestamp, 
            t.status, 
            c.name as counter, 
            t.notes, 
            t.tags,
            t.service_id as serviceId
        FROM tickets t
        LEFT JOIN counters c ON t.counter_id = c.id
        ORDER BY t.timestamp DESC
    `).all() as any[];

    return rows.map(row => ({
        ...row,
        timestamp: new Date(row.timestamp),
        tags: row.tags ? row.tags.split(',') : [],
    }));
}

export async function addTicket(service: Service): Promise<Ticket> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const prefix = service.prefix;
  const countResult = db.prepare(
    'SELECT COUNT(*) as count FROM tickets WHERE number LIKE ? AND timestamp >= ?'
  ).get(`${prefix}-%`, todayStart.getTime()) as { count: number };
  
  const nextNumber = countResult.count + 1;
  const ticketNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

  const id = `t-${Date.now()}-${Math.random()}`;
  const timestamp = new Date();
  const status = 'waiting';

  db.prepare(`
        INSERT INTO tickets (id, number, service_id, timestamp, status, service_name)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, ticketNumber, service.id, timestamp.getTime(), status, service.name);
    
  const newTicket: Ticket = {
    id,
    number: ticketNumber,
    serviceId: service.id,
    serviceName: service.name,
    timestamp: timestamp,
    status: 'waiting',
  };

  return newTicket;
}


export async function updateTicketStatus(id: string, status: TicketStatus, counterId?: string): Promise<void> {
    db.prepare(`
        UPDATE tickets 
        SET status = ?, counter_id = ?
        WHERE id = ?
    `).run(status, counterId, id);
}

export async function finalizeTicket(id: string, notes: string, tags: string[]): Promise<void> {
    db.prepare(`
        UPDATE tickets
        SET status = 'finished', notes = ?, tags = ?
        WHERE id = ?
    `).run(notes, tags.join(','), id);
}

export async function resetTickets(): Promise<{ count: number }> {
    const result = db.prepare(`
        UPDATE tickets
        SET status = 'cancelled'
        WHERE status = 'waiting' OR status = 'in-progress'
    `).run();
    return { count: result.changes };
}


export async function getServiceById(id: string): Promise<Service | null> {
    const row = db.prepare('SELECT id, name, prefix, category_id as category FROM services WHERE id = ?').get(id) as any;
    return row || null;
}

export async function getCounterById(id: string): Promise<Counter | null> {
    const row = db.prepare('SELECT id, name FROM counters WHERE id = ?').get(id) as any;
     if (!row) return null;
    const assignedCategories = db.prepare('SELECT category_id FROM counter_categories WHERE counter_id = ?').all(id).map((cat: any) => cat.category_id);
    return { ...row, assignedCategories };
}