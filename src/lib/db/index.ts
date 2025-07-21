
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
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL DEFAULT 'Box'
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'Box',
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
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
      priority_weight INTEGER NOT NULL,
      icon TEXT NOT NULL DEFAULT 'Box'
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      service_id TEXT NOT NULL,
      created_timestamp INTEGER NOT NULL,
      called_timestamp INTEGER,
      finished_timestamp INTEGER,
      status TEXT NOT NULL,
      priority_weight INTEGER NOT NULL,
      counter_id TEXT,
      clerk_id TEXT,
      notes TEXT,
      tags TEXT,
      service_name TEXT,
      FOREIGN KEY (service_id) REFERENCES services (id),
      FOREIGN KEY (counter_id) REFERENCES counters (id),
      FOREIGN KEY (clerk_id) REFERENCES users (id)
    );

     CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'clerk')),
      counter_id TEXT,
      FOREIGN KEY (counter_id) REFERENCES counters (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)');
    mockCategories.forEach(cat => insertCategory.run(cat.id, cat.name, cat.icon));
  }

  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (serviceCount.count === 0) {
    const insertService = db.prepare('INSERT INTO services (id, name, category_id, icon) VALUES (?, ?, ?, ?)');
    mockServices.forEach(srv => insertService.run(srv.id, srv.name, srv.categoryId, srv.icon));
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
    const insertTicketType = db.prepare('INSERT INTO ticket_types (id, name, description, prefix, priority_weight, icon) VALUES (?, ?, ?, ?, ?, ?)');
    mockTicketTypes.forEach(tt => insertTicketType.run(tt.id, tt.name, tt.description, tt.prefix, tt.priorityWeight, tt.icon));
  }


  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('organizationName') as { count: number };
  if (settingsCount.count === 0) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('organizationName', 'Nome da Organização');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('organizationLogo', '');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('theme.primary', '210 70% 50%');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('theme.accent', '180 60% 40%');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('theme.background', '210 20% 95%');
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('advertisementBanner', '');
  }
}

// Check if columns exist and add them if not
function migrateDb() {
    try { db.prepare('SELECT service_name FROM tickets LIMIT 1').get(); } catch (e) { db.exec('ALTER TABLE tickets ADD COLUMN service_name TEXT'); }
    try { db.prepare('SELECT priority_weight FROM tickets LIMIT 1').get(); } catch(e) { db.exec('ALTER TABLE tickets ADD COLUMN priority_weight INTEGER NOT NULL DEFAULT 1'); }
    try { db.prepare('SELECT icon FROM categories LIMIT 1').get(); } catch (e) { db.exec("ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT 'Box'"); }
    try { db.prepare('SELECT icon FROM services LIMIT 1').get(); } catch (e) { db.exec("ALTER TABLE services ADD COLUMN icon TEXT NOT NULL DEFAULT 'Box'"); }
    try { db.prepare('SELECT icon FROM ticket_types LIMIT 1').get(); } catch (e) { db.exec("ALTER TABLE ticket_types ADD COLUMN icon TEXT NOT NULL DEFAULT 'Box'"); }
    
    // Migration for Dashboard Timestamps
    try { db.prepare('SELECT created_timestamp FROM tickets LIMIT 1').get(); } catch (e) { 
        db.exec('ALTER TABLE tickets RENAME COLUMN timestamp TO created_timestamp');
        db.exec('ALTER TABLE tickets ADD COLUMN called_timestamp INTEGER');
        db.exec('ALTER TABLE tickets ADD COLUMN finished_timestamp INTEGER');
        db.exec('ALTER TABLE tickets ADD COLUMN clerk_id TEXT REFERENCES users(id)');
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
  const rows = db.prepare('SELECT s.id, s.name, s.category_id as categoryId, s.icon FROM services s').all() as any[];
  return rows;
}

export async function getServicesByCategory(categoryId: string): Promise<Service[]> {
  const rows = db.prepare('SELECT id, name, category_id as categoryId, icon FROM services WHERE category_id = ?').all(categoryId) as any[];
  return rows;
}

export async function getServicesForCounter(counterId: string): Promise<Service[]> {
    const rows = db.prepare(`
        SELECT s.id, s.name, s.category_id as categoryId, s.icon
        FROM services s
        JOIN counter_categories cc ON s.category_id = cc.category_id
        WHERE cc.counter_id = ?
    `).all(counterId) as any[];
    return rows;
}

export async function addService(data: Omit<Service, 'id'>): Promise<void> {
  const id = `srv-${Date.now()}`;
  db.prepare('INSERT INTO services (id, name, category_id, icon) VALUES (?, ?, ?, ?)').run(id, data.name, data.categoryId, data.icon);
}

export async function updateService(id: string, data: Omit<Service, 'id'>): Promise<void> {
  db.prepare('UPDATE services SET name = ?, category_id = ?, icon = ? WHERE id = ?').run(data.name, data.categoryId, data.icon, id);
}

export async function deleteService(id: string): Promise<void> {
  db.prepare('DELETE FROM services WHERE id = ?').run(id);
}


// Category Functions
export async function getCategories(): Promise<Category[]> {
  const rows = db.prepare('SELECT id, name, icon FROM categories ORDER BY name ASC').all() as any[];
  return rows;
}

export async function addCategory(name: string, icon: string): Promise<void> {
  const id = `cat-${Date.now()}`;
  db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)').run(id, name, icon);
}

export async function updateCategory(id: string, name: string, icon: string): Promise<void> {
  db.prepare('UPDATE categories SET name = ?, icon = ? WHERE id = ?').run(name, icon, id);
}

export async function deleteCategory(id: string): Promise<void> {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}


// Counter Functions
export async function getCounters(): Promise<Counter[]> {
  const counters = db.prepare('SELECT id, name FROM counters ORDER BY name ASC').all() as any[];
  const stmt = db.prepare('SELECT category_id FROM counter_categories WHERE counter_id = ?');

  return counters.map(counter => {
    const assignedCategories = stmt.all(counter.id).map((row: any) => row.category_id);
    return { ...counter, assignedCategories };
  });
}

export async function addCounter(name: string, assignedCategories: string[]): Promise<void> {
    const id = `ctr-${Date.now()}`;
    const transaction = db.transaction(() => {
        db.prepare('INSERT INTO counters (id, name) VALUES (?, ?)').run(id, name);
        const insertCat = db.prepare('INSERT INTO counter_categories (counter_id, category_id) VALUES (?, ?)');
        for (const catId of assignedCategories) {
            insertCat.run(id, catId);
        }
    });
    transaction();
}

export async function updateCounter(id: string, name: string, assignedCategories: string[]): Promise<void> {
    const transaction = db.transaction(() => {
        db.prepare('UPDATE counters SET name = ? WHERE id = ?').run(name, id);
        db.prepare('DELETE FROM counter_categories WHERE counter_id = ?').run(id);
        const insertCat = db.prepare('INSERT INTO counter_categories (counter_id, category_id) VALUES (?, ?)');
        for (const catId of assignedCategories) {
            insertCat.run(id, catId);
        }
    });
    transaction();
}

export async function deleteCounter(id: string): Promise<void> {
    // Foreign key on users table is ON DELETE SET NULL, so this is safe.
    db.prepare('DELETE FROM counters WHERE id = ?').run(id);
}


// Ticket Functions
export async function getTickets(): Promise<Ticket[]> {
    const rows = db.prepare(`
        SELECT 
            t.id, 
            t.number, 
            t.service_name as serviceName, 
            t.created_timestamp as timestamp, 
            t.status,
            t.priority_weight as priorityWeight,
            c.name as counter, 
            t.notes, 
            t.tags,
            t.service_id as serviceId
        FROM tickets t
        LEFT JOIN counters c ON t.counter_id = c.id
        ORDER BY t.created_timestamp DESC
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
    'SELECT COUNT(*) as count FROM tickets WHERE number LIKE ? AND created_timestamp >= ?'
  ).get(`${prefix}-%`, todayStart.getTime()) as { count: number };
  
  const nextNumber = countResult.count + 1;
  const ticketNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

  const id = `t-${Date.now()}-${Math.random()}`;
  const timestamp = new Date();
  const status = 'waiting';

  db.prepare(`
        INSERT INTO tickets (id, number, service_id, created_timestamp, status, service_name, priority_weight)
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


export async function updateTicketStatus(id: string, status: TicketStatus, counterId?: string, clerkId?: string): Promise<void> {
    const updates: string[] = ['status = ?'];
    const params: (string | number | null)[] = [status];

    if (status === 'in-progress') {
        updates.push('called_timestamp = ?');
        params.push(Date.now());
        if (counterId) {
            updates.push('counter_id = ?');
            params.push(counterId);
        }
        if (clerkId) {
            updates.push('clerk_id = ?');
            params.push(clerkId);
        }
    }
    
    params.push(id);

    db.prepare(`
        UPDATE tickets 
        SET ${updates.join(', ')}
        WHERE id = ?
    `).run(...params);
}


export async function finalizeTicket(id: string, notes: string, tags: string[]): Promise<void> {
    db.prepare(`
        UPDATE tickets
        SET status = 'finished', notes = ?, tags = ?, finished_timestamp = ?
        WHERE id = ?
    `).run(notes, tags.join(','), Date.now(), id);
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
    const row = db.prepare('SELECT id, name, category_id as categoryId, icon FROM services WHERE id = ?').get(id) as any;
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
        ORDER BY u.name ASC
    `).all() as any[];
    return rows;
}

export async function getUserById(id: string): Promise<User | null> {
    const row = db.prepare('SELECT id, name, username, role, counter_id as counterId FROM users WHERE id = ?').get(id) as any;
    return row || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
    const row = db.prepare('SELECT id, name, username, password, role, counter_id FROM users WHERE username = ?').get(username) as User | undefined;
    return row || null;
}

type UserData = Omit<User, 'id' | 'counterName'>;
export async function addUser(data: UserData): Promise<void> {
    const id = `usr-${Date.now()}`;
    // In a real app, hash the password.
    db.prepare('INSERT INTO users (id, name, username, password, role, counter_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, data.name, data.username, data.password, data.role, data.role === 'clerk' ? data.counterId : null);
}

export async function updateUser(id: string, data: Partial<UserData>): Promise<void> {
    let fields = 'name = ?, username = ?, role = ?, counter_id = ?';
    const params: (string | null)[] = [data.name!, data.username!, data.role!, data.role === 'clerk' ? data.counterId! : null];

    if (data.password) {
        fields += ', password = ?';
        params.push(data.password);
    }
    
    params.push(id);

    db.prepare(`UPDATE users SET ${fields} WHERE id = ?`).run(...params);
}

export async function deleteUser(id: string): Promise<void> {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}


// Ticket Type Functions
export async function getTicketTypes(): Promise<TicketType[]> {
  const rows = db.prepare('SELECT id, name, description, prefix, priority_weight as priorityWeight, icon FROM ticket_types ORDER BY priority_weight DESC').all() as any[];
  return rows;
}

export async function addTicketType(data: Omit<TicketType, 'id'>): Promise<void> {
  const id = `tt-${Date.now()}`;
  db.prepare('INSERT INTO ticket_types (id, name, description, prefix, priority_weight, icon) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, data.name, data.description, data.prefix, data.priorityWeight, data.icon);
}

export async function updateTicketType(id: string, data: Omit<TicketType, 'id'>): Promise<void> {
  db.prepare('UPDATE ticket_types SET name = ?, description = ?, prefix = ?, priority_weight = ?, icon = ? WHERE id = ?')
    .run(data.name, data.description, data.prefix, data.priorityWeight, data.icon, id);
}

export async function deleteTicketType(id: string): Promise<void> {
  db.prepare('DELETE FROM ticket_types WHERE id = ?').run(id);
}


// Dashboard Functions
export async function getDashboardMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();

    // Tickets Today
    const ticketsToday = db.prepare('SELECT count(*) as count FROM tickets WHERE created_timestamp >= ?').get(todayStartMs) as { count: number };

    // Waiting Now
    const waitingNow = db.prepare("SELECT count(*) as count FROM tickets WHERE status = 'waiting'").get() as { count: number };
    
    // Average Times
    const finishedToday = db.prepare('SELECT created_timestamp, called_timestamp, finished_timestamp FROM tickets WHERE status = "finished" AND created_timestamp >= ?').all(todayStartMs) as any[];
    
    let totalWaitTime = 0;
    let totalServiceTime = 0;
    let finishedCount = 0;

    finishedToday.forEach(t => {
        if (t.called_timestamp && t.created_timestamp) {
            totalWaitTime += t.called_timestamp - t.created_timestamp;
        }
        if (t.finished_timestamp && t.called_timestamp) {
            totalServiceTime += t.finished_timestamp - t.called_timestamp;
            finishedCount++;
        }
    });

    const avgWaitTimeSeconds = finishedCount > 0 ? (totalWaitTime / finishedCount) / 1000 : 0;
    const avgServiceTimeSeconds = finishedCount > 0 ? (totalServiceTime / finishedCount) / 1000 : 0;
    
    // Top Services
    const topServices = db.prepare(`
        SELECT service_name as name, COUNT(*) as count 
        FROM tickets 
        WHERE created_timestamp >= ?
        GROUP BY service_name 
        ORDER BY count DESC 
        LIMIT 5
    `).all(todayStartMs);

    // Tickets Last 7 Days
    const ticketsLast7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

        const row = db.prepare('SELECT count(*) as count FROM tickets WHERE created_timestamp >= ? AND created_timestamp <= ?').get(dayStart.getTime(), dayEnd.getTime()) as { count: number };
        
        ticketsLast7Days.push({
            date: dayStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'}),
            count: row.count
        });
    }

    return {
        ticketsToday: ticketsToday.count,
        waitingNow: waitingNow.count,
        avgWaitTimeSeconds,
        avgServiceTimeSeconds,
        topServices,
        ticketsLast7Days,
    };
}


export async function getRecentTickets(limit: number = 5) {
    const rows = db.prepare(`
        SELECT 
            t.id,
            t.number,
            t.service_name as serviceName,
            u.name as clerkName,
            (t.called_timestamp - t.created_timestamp) / 1000 as waitTime,
            (t.finished_timestamp - t.called_timestamp) / 1000 as serviceTime
        FROM tickets t
        LEFT JOIN users u ON t.clerk_id = u.id
        WHERE t.status = 'finished'
        ORDER BY t.finished_timestamp DESC
        LIMIT ?
    `).all(limit) as any[];
    return rows;
}
