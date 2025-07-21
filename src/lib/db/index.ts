
'use server';

import Database from 'better-sqlite3';
import {
  Category,
  Counter,
  Service,
  Ticket,
  TicketStatus,
  User,
  TicketType,
} from '../types';
import { mockCategories, mockCounters, mockServices, mockUsers, mockTicketTypes } from '../mock-data';

const db = new Database('passflow.db');
db.pragma('foreign_keys = ON'); // Enable foreign key constraints

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS counter_categories (
        counter_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        PRIMARY KEY (counter_id, category_id),
        FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

     CREATE TABLE IF NOT EXISTS ticket_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      prefix TEXT NOT NULL UNIQUE,
      priority_weight INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      service_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      status TEXT NOT NULL,
      priority_weight INTEGER NOT NULL,
      counter_id TEXT,
      notes TEXT,
      tags TEXT,
      service_name TEXT,
      FOREIGN KEY (service_id) REFERENCES services (id),
      FOREIGN KEY (counter_id) REFERENCES counters (id)
    );

     CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      counter_id TEXT,
      FOREIGN KEY (counter_id) REFERENCES counters (id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  
  // Drop prefix from services if it exists
  try {
      db.prepare('SELECT prefix FROM services LIMIT 1').get();
      // If the above does not throw, the column exists. We need to recreate the table.
      console.log("Legacy `services` table found. Migrating...");
      db.exec('PRAGMA foreign_keys=off;');
      db.exec(`
        CREATE TABLE services_new (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category_id TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
        );
        INSERT INTO services_new (id, name, category_id) SELECT id, name, category_id FROM services;
        DROP TABLE services;
        ALTER TABLE services_new RENAME TO services;
      `);
       db.exec('PRAGMA foreign_keys=on;');
       console.log("Migration complete.");
  } catch (e) {
      // Column does not exist, schema is up to date.
  }


  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
    mockCategories.forEach(cat => insertCategory.run(cat.id, cat.name));
  }

  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (serviceCount.count === 0) {
    const insertService = db.prepare('INSERT INTO services (id, name, category_id) VALUES (?, ?, ?)');
    mockServices.forEach(srv => insertService.run(srv.id, srv.name, srv.categoryId));
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
  
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (id, name, username, password, role, counter_id) VALUES (?, ?, ?, ?, ?, ?)');
    mockUsers.forEach(user => insertUser.run(user.id, user.name, user.username, user.password, user.role, user.counterId));
  }
  
  const ticketTypeCount = db.prepare('SELECT COUNT(*) as count FROM ticket_types').get() as { count: number };
  if (ticketTypeCount.count === 0) {
    const insertTicketType = db.prepare('INSERT INTO ticket_types (id, name, description, prefix, priority_weight) VALUES (?, ?, ?, ?, ?)');
    mockTicketTypes.forEach(tt => insertTicketType.run(tt.id, tt.name, tt.description, tt.prefix, tt.priorityWeight));
  }


  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('organizationName') as { count: number };
  if (settingsCount.count === 0) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('organizationName', 'Nome da Organização');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('organizationLogo', '');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('theme.primary', '210 70% 50%');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('theme.accent', '180 60% 40%');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('theme.background', '210 20% 95%');
  }
}

// Check if 'service_name' column exists and add it if not
function migrateDb() {
    try {
        db.prepare('SELECT service_name FROM tickets LIMIT 1').get();
    } catch (e) {
        db.exec('ALTER TABLE tickets ADD COLUMN service_name TEXT');
    }
    
    try {
        db.prepare('SELECT priority_weight FROM tickets LIMIT 1').get();
    } catch(e) {
        db.exec('ALTER TABLE tickets ADD COLUMN priority_weight INTEGER NOT NULL DEFAULT 1');
    }
}


initDb();
migrateDb();

// Settings Functions
export async function getSetting(key: string): Promise<string | null> {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row ? row.value : null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
    const placeholders = keys.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`);
    const rows = stmt.all(...keys) as { key: string, value: string }[];
    
    const settings: Record<string, string | null> = {};
    keys.forEach(key => settings[key] = null); // Initialize with null
    rows.forEach(row => settings[row.key] = row.value);

    return settings;
}

export async function updateSetting(key: string, value: string): Promise<void> {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction(() => {
        for (const [key, value] of Object.entries(settings)) {
            stmt.run(key, value);
        }
    });
    transaction();
}

// Service Functions
export async function getServices(): Promise<Service[]> {
  const rows = db.prepare('SELECT s.id, s.name, s.category_id as categoryId FROM services s').all() as any[];
  return rows;
}

export async function getServicesByCategory(categoryId: string): Promise<Service[]> {
  const rows = db.prepare('SELECT id, name, category_id as categoryId FROM services WHERE category_id = ?').all(categoryId) as any[];
  return rows;
}

export async function getServicesForCounter(counterId: string): Promise<Service[]> {
    const rows = db.prepare(`
        SELECT s.id, s.name, s.category_id as categoryId
        FROM services s
        JOIN counter_categories cc ON s.category_id = cc.category_id
        WHERE cc.counter_id = ?
    `).all(counterId) as any[];
    return rows;
}


// Category Functions
export async function getCategories(): Promise<Category[]> {
  const rows = db.prepare('SELECT id, name FROM categories ORDER BY name ASC').all() as any[];
  return rows;
}

export async function addCategory(name: string): Promise<void> {
  const id = `cat-${Date.now()}`;
  db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').run(id, name);
}

export async function updateCategory(id: string, name: string): Promise<void> {
  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
}

export async function deleteCategory(id: string): Promise<void> {
  // Foreign key constraints will prevent deletion if the category is in use
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
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
            t.priority_weight as priorityWeight,
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

export async function addTicket(service: Service, ticketType: TicketType): Promise<Ticket> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const prefix = ticketType.prefix;
  
  const countResult = db.prepare(
    'SELECT COUNT(*) as count FROM tickets WHERE number LIKE ? AND timestamp >= ?'
  ).get(`${prefix}-%`, todayStart.getTime()) as { count: number };
  
  const nextNumber = countResult.count + 1;
  const ticketNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

  const id = `t-${Date.now()}-${Math.random()}`;
  const timestamp = new Date();
  const status = 'waiting';

  db.prepare(`
        INSERT INTO tickets (id, number, service_id, timestamp, status, service_name, priority_weight)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, ticketNumber, service.id, timestamp.getTime(), status, service.name, ticketType.priorityWeight);
    
  const newTicket: Ticket = {
    id,
    number: ticketNumber,
    serviceId: service.id,
    serviceName: service.name,
    timestamp: timestamp,
    status: 'waiting',
    priorityWeight: ticketType.priorityWeight,
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
    const row = db.prepare('SELECT id, name, category_id as categoryId FROM services WHERE id = ?').get(id) as any;
    return row || null;
}

export async function getCounterById(id: string): Promise<Counter | null> {
    const row = db.prepare('SELECT id, name FROM counters WHERE id = ?').get(id) as any;
     if (!row) return null;
    const assignedCategories = db.prepare('SELECT category_id FROM counter_categories WHERE counter_id = ?').all(id).map((cat: any) => cat.category_id);
    return { ...row, assignedCategories };
}

// User Functions
export async function getUsers(): Promise<User[]> {
    const rows = db.prepare(`
        SELECT u.id, u.name, u.username, u.role, u.counter_id, c.name as counterName
        FROM users u
        LEFT JOIN counters c ON u.counter_id = c.id
    `).all() as any[];
    return rows;
}

export async function getUserByUsername(username: string): Promise<User | null> {
    const row = db.prepare('SELECT id, name, username, password, role, counter_id FROM users WHERE username = ?').get(username) as User | undefined;
    return row || null;
}

// Ticket Type Functions
export async function getTicketTypes(): Promise<TicketType[]> {
  const rows = db.prepare('SELECT id, name, description, prefix, priority_weight as priorityWeight FROM ticket_types ORDER BY priority_weight DESC').all() as any[];
  return rows;
}

export async function addTicketType(data: Omit<TicketType, 'id'>): Promise<void> {
  const id = `tt-${Date.now()}`;
  db.prepare('INSERT INTO ticket_types (id, name, description, prefix, priority_weight) VALUES (?, ?, ?, ?, ?)')
    .run(id, data.name, data.description, data.prefix, data.priorityWeight);
}

export async function updateTicketType(id: string, data: Omit<TicketType, 'id'>): Promise<void> {
  db.prepare('UPDATE ticket_types SET name = ?, description = ?, prefix = ?, priority_weight = ? WHERE id = ?')
    .run(data.name, data.description, data.prefix, data.priorityWeight, id);
}

export async function deleteTicketType(id: string): Promise<void> {
  db.prepare('DELETE FROM ticket_types WHERE id = ?').run(id);
}
