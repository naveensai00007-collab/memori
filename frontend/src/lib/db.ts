import Dexie, { Table } from 'dexie';
import { Item, Location, Reminder, SyncOperation } from '../../../shared/types';

export class MemoriDatabase extends Dexie {
  items!: Table<Item, string>;
  locations!: Table<Location, string>;
  reminders!: Table<Reminder, string>;
  pending_operations!: Table<SyncOperation, string>;

  constructor() {
    super('MemoriLocalDB');
    this.version(1).stores({
      items: 'id, user_id, category, status, expiry_date, reminder_date, version, updated_at, [user_id+category], [user_id+status]',
      locations: 'id, user_id, type, updated_at',
      reminders: 'id, user_id, item_id, scheduled_date, triggered, acknowledged, updated_at',
      pending_operations: 'id, entity, action, timestamp, version',
    });
  }
}

export const db = new MemoriDatabase();
