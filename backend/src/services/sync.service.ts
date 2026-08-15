import prisma from '../config/database';
import { SyncOperation, SyncPushResponse, SyncPullResponse } from '../../../shared/types';
import { logger } from '../lib/logger';

export class SyncService {
  static async pushOperations(userId: string, operations: SyncOperation[]): Promise<SyncPushResponse> {
    const accepted: string[] = [];
    const conflicts: any[] = [];

    for (const op of operations) {
      try {
        if (op.entity === 'item') {
          if (op.action === 'create') {
            const tags = JSON.stringify(op.data.tags || []);
            await prisma.item.upsert({
              where: { id: op.data.id || op.id },
              create: {
                id: op.data.id || op.id,
                user_id: userId,
                title: op.data.title,
                category: op.data.category,
                subcategory: op.data.subcategory || null,
                status: op.data.status || 'missing',
                description: op.data.description || null,
                notes: op.data.notes || null,
                tags,
                physical_location: op.data.physical_location || null,
                digital_copy_uri: op.data.digital_copy_uri || null,
                location_id: op.data.location_id || null,
                expiry_date: op.data.expiry_date || null,
                reminder_date: op.data.reminder_date || null,
                sensitive_data: op.data.sensitive_data || null,
                version: op.version || 1,
              },
              update: {
                title: op.data.title,
                category: op.data.category,
                subcategory: op.data.subcategory || null,
                status: op.data.status || 'missing',
                description: op.data.description || null,
                notes: op.data.notes || null,
                tags,
                physical_location: op.data.physical_location || null,
                digital_copy_uri: op.data.digital_copy_uri || null,
                location_id: op.data.location_id || null,
                expiry_date: op.data.expiry_date || null,
                reminder_date: op.data.reminder_date || null,
                sensitive_data: op.data.sensitive_data || null,
                version: op.version || 1,
              },
            });
            accepted.push(op.id);
          } else if (op.action === 'update') {
            const existing = await prisma.item.findFirst({
              where: { id: op.data.id || op.id, user_id: userId },
            });

            if (existing && existing.version > op.version) {
              // Conflict: server has newer version
              conflicts.push({
                id: op.id,
                entity: 'item',
                clientVersion: op.version,
                serverVersion: existing.version,
                serverData: {
                  ...existing,
                  tags: JSON.parse(existing.tags || '[]'),
                },
              });
            } else {
              const tags = op.data.tags ? JSON.stringify(op.data.tags) : undefined;
              await prisma.item.update({
                where: { id: op.data.id || op.id },
                data: {
                  title: op.data.title,
                  category: op.data.category,
                  subcategory: op.data.subcategory,
                  status: op.data.status,
                  description: op.data.description,
                  notes: op.data.notes,
                  tags,
                  physical_location: op.data.physical_location,
                  digital_copy_uri: op.data.digital_copy_uri,
                  location_id: op.data.location_id,
                  expiry_date: op.data.expiry_date,
                  reminder_date: op.data.reminder_date,
                  sensitive_data: op.data.sensitive_data,
                  version: (op.version || 1) + 1,
                },
              });
              accepted.push(op.id);
            }
          } else if (op.action === 'delete') {
            await prisma.item.deleteMany({
              where: { id: op.data.id || op.id, user_id: userId },
            });
            accepted.push(op.id);
          }
        }
      } catch (err: any) {
        logger.error('Failed to apply sync operation', { op, error: err.message });
      }
    }

    // Update sync metadata
    const syncMeta = await prisma.syncMetadata.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        last_sync_at: new Date(),
        local_version: 1,
      },
      update: {
        last_sync_at: new Date(),
        local_version: { increment: 1 },
      },
    });

    return {
      accepted,
      conflicts,
      serverVersion: syncMeta.local_version,
    };
  }

  static async pullChanges(userId: string, since?: string): Promise<SyncPullResponse> {
    const sinceDate = since ? new Date(since) : new Date(0);

    const [itemsRaw, locationsRaw, remindersRaw, syncMeta] = await Promise.all([
      prisma.item.findMany({
        where: {
          user_id: userId,
          updated_at: { gte: sinceDate },
        },
        include: { location: true },
      }),
      prisma.location.findMany({
        where: {
          user_id: userId,
          updated_at: { gte: sinceDate },
        },
      }),
      prisma.reminder.findMany({
        where: {
          user_id: userId,
          updated_at: { gte: sinceDate },
        },
      }),
      prisma.syncMetadata.findUnique({
        where: { user_id: userId },
      }),
    ]);

    const items = itemsRaw.map(i => ({
      ...i,
      category: i.category as any,
      status: i.status as any,
      tags: JSON.parse(i.tags || '[]'),
      created_at: i.created_at.toISOString(),
      updated_at: i.updated_at.toISOString(),
      last_reviewed_at: i.last_reviewed_at?.toISOString() || null,
      location: i.location ? {
        ...i.location,
        type: i.location.type as any,
        created_at: i.location.created_at.toISOString(),
        updated_at: i.location.updated_at.toISOString(),
      } : null,
    }));

    const locations = locationsRaw.map(l => ({
      ...l,
      type: l.type as any,
      created_at: l.created_at.toISOString(),
      updated_at: l.updated_at.toISOString(),
    }));

    const reminders: any = remindersRaw.map(r => ({
      ...r,
      type: r.type as any,
      sent_at: r.sent_at ? r.sent_at.toISOString() : null,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));

    return {
      items,
      locations,
      reminders,
      serverVersion: syncMeta?.local_version || 1,
      timestamp: new Date().toISOString(),
    };
  }
}
