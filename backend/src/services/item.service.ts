import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Category, Status, ItemFilterParams, LifeStats } from '../../../shared/types';

export class ItemService {
  static async listItems(userId: string, params: ItemFilterParams) {
    const { category, status, tag, search, limit = 50, offset = 0 } = params;

    const where: any = {
      user_id: userId,
    };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { subcategory: { contains: q } },
        { physical_location: { contains: q } },
        { notes: { contains: q } },
      ];
    }

    const [total, itemsRaw] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { updated_at: 'desc' },
        include: { location: true },
      }),
    ]);

    let items = itemsRaw.map(item => ({
      ...item,
      tags: JSON.parse(item.tags || '[]'),
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
      last_reviewed_at: item.last_reviewed_at ? item.last_reviewed_at.toISOString() : null,
    }));

    if (tag) {
      items = items.filter(i => i.tags.includes(tag));
    }

    return {
      items,
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  static async getItemById(userId: string, itemId: string) {
    const item = await prisma.item.findFirst({
      where: { id: itemId, user_id: userId },
      include: { location: true, reminders: true },
    });

    if (!item) {
      throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }

    return {
      ...item,
      tags: JSON.parse(item.tags || '[]'),
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
      last_reviewed_at: item.last_reviewed_at ? item.last_reviewed_at.toISOString() : null,
    };
  }

  static async createItem(userId: string, data: any) {
    const tagsJson = JSON.stringify(data.tags || []);
    
    // Auto-calculate status if expiry_date is passed
    let itemStatus = data.status || 'missing';
    if (data.expiry_date) {
      const exp = new Date(data.expiry_date);
      if (!isNaN(exp.getTime()) && exp < new Date()) {
        itemStatus = 'needs_attention';
      }
    }

    const item = await prisma.item.create({
      data: {
        user_id: userId,
        title: data.title.trim(),
        category: data.category,
        subcategory: data.subcategory || null,
        status: itemStatus,
        description: data.description || null,
        notes: data.notes || null,
        tags: tagsJson,
        physical_location: data.physical_location || null,
        digital_copy_uri: data.digital_copy_uri || null,
        location_id: data.location_id || null,
        expiry_date: data.expiry_date || null,
        reminder_date: data.reminder_date || null,
        sensitive_data: data.sensitive_data || null,
        version: 1,
      },
      include: { location: true },
    });

    // Auto-create reminder if reminder_date is set
    if (data.reminder_date) {
      await prisma.reminder.create({
        data: {
          user_id: userId,
          item_id: item.id,
          type: data.expiry_date ? 'expiry' : 'review',
          scheduled_date: data.reminder_date,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action: 'item_created',
        metadata: JSON.stringify({ item_id: item.id, title: item.title }),
      },
    });

    return {
      ...item,
      tags: JSON.parse(item.tags || '[]'),
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
      last_reviewed_at: item.last_reviewed_at ? item.last_reviewed_at.toISOString() : null,
    };
  }

  static async updateItem(userId: string, itemId: string, data: any) {
    const existing = await prisma.item.findFirst({
      where: { id: itemId, user_id: userId },
    });

    if (!existing) {
      throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }

    // Optimistic locking check
    if (data.version !== undefined && data.version < existing.version) {
      throw new AppError('Conflict: This item has been modified by another session.', 409, 'VERSION_CONFLICT');
    }

    const updatePayload: any = {
      version: existing.version + 1,
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.subcategory !== undefined) updatePayload.subcategory = data.subcategory;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.tags !== undefined) updatePayload.tags = JSON.stringify(data.tags);
    if (data.physical_location !== undefined) updatePayload.physical_location = data.physical_location;
    if (data.digital_copy_uri !== undefined) updatePayload.digital_copy_uri = data.digital_copy_uri;
    if (data.location_id !== undefined) updatePayload.location_id = data.location_id;
    if (data.expiry_date !== undefined) updatePayload.expiry_date = data.expiry_date;
    if (data.reminder_date !== undefined) updatePayload.reminder_date = data.reminder_date;
    if (data.sensitive_data !== undefined) updatePayload.sensitive_data = data.sensitive_data;

    // Check expiry
    if (updatePayload.expiry_date) {
      const exp = new Date(updatePayload.expiry_date);
      if (!isNaN(exp.getTime()) && exp < new Date() && updatePayload.status === 'complete') {
        updatePayload.status = 'needs_attention';
      }
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: updatePayload,
      include: { location: true },
    });

    // Update or create reminder if reminder_date changed
    if (data.reminder_date && data.reminder_date !== existing.reminder_date) {
      await prisma.reminder.upsert({
        where: { id: (await prisma.reminder.findFirst({ where: { item_id: itemId } }))?.id || 'none' },
        create: {
          user_id: userId,
          item_id: itemId,
          type: updated.expiry_date ? 'expiry' : 'review',
          scheduled_date: data.reminder_date,
        },
        update: {
          scheduled_date: data.reminder_date,
          triggered: false,
          acknowledged: false,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action: 'item_updated',
        metadata: JSON.stringify({ item_id: itemId, title: updated.title }),
      },
    });

    return {
      ...updated,
      tags: JSON.parse(updated.tags || '[]'),
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
      last_reviewed_at: updated.last_reviewed_at ? updated.last_reviewed_at.toISOString() : null,
    };
  }

  static async deleteItem(userId: string, itemId: string) {
    const existing = await prisma.item.findFirst({
      where: { id: itemId, user_id: userId },
    });

    if (!existing) {
      throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }

    await prisma.item.delete({
      where: { id: itemId },
    });

    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action: 'item_deleted',
        metadata: JSON.stringify({ item_id: itemId, title: existing.title }),
      },
    });

    return { success: true };
  }

  static async markReviewed(userId: string, itemId: string) {
    const item = await prisma.item.findFirst({
      where: { id: itemId, user_id: userId },
    });

    if (!item) {
      throw new AppError('Item not found.', 404, 'ITEM_NOT_FOUND');
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: {
        last_reviewed_at: new Date(),
        version: item.version + 1,
      },
    });

    return {
      ...updated,
      tags: JSON.parse(updated.tags || '[]'),
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
      last_reviewed_at: updated.last_reviewed_at?.toISOString() || null,
    };
  }

  static async getStats(userId: string): Promise<LifeStats> {
    const items = await prisma.item.findMany({
      where: { user_id: userId },
      select: { category: true, status: true },
    });

    const total_items = items.length;
    let complete_count = 0;
    let missing_count = 0;
    let needs_attention_count = 0;
    let not_applicable_count = 0;

    const categories: Category[] = ['identity', 'education', 'money', 'digital', 'assets', 'government', 'other'];
    const category_breakdown: any = {};

    categories.forEach(c => {
      category_breakdown[c] = { total: 0, complete: 0, missing: 0, needs_attention: 0 };
    });

    items.forEach(i => {
      const cat = i.category as Category;
      if (category_breakdown[cat]) {
        category_breakdown[cat].total += 1;
        if (i.status === 'complete') {
          complete_count += 1;
          category_breakdown[cat].complete += 1;
        } else if (i.status === 'missing') {
          missing_count += 1;
          category_breakdown[cat].missing += 1;
        } else if (i.status === 'needs_attention') {
          needs_attention_count += 1;
          category_breakdown[cat].needs_attention += 1;
        } else if (i.status === 'not_applicable') {
          not_applicable_count += 1;
        }
      }
    });

    const activeTotal = total_items - not_applicable_count;
    const completeness_percentage = activeTotal > 0 
      ? Math.round((complete_count / activeTotal) * 100) 
      : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingRemindersRaw = await prisma.reminder.findMany({
      where: {
        user_id: userId,
        scheduled_date: { gte: todayStr },
        acknowledged: false,
      },
      take: 5,
      orderBy: { scheduled_date: 'asc' },
      include: { item: true },
    });

    const upcoming_reminders: any = upcomingRemindersRaw.map(r => ({
      ...r,
      type: r.type as any,
      sent_at: r.sent_at ? r.sent_at.toISOString() : null,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
      item: r.item ? {
        ...r.item,
        category: r.item.category as any,
        status: r.item.status as any,
        tags: JSON.parse(r.item.tags || '[]'),
        last_reviewed_at: r.item.last_reviewed_at ? r.item.last_reviewed_at.toISOString() : null,
        created_at: r.item.created_at.toISOString(),
        updated_at: r.item.updated_at.toISOString(),
      } : undefined,
    }));

    return {
      total_items,
      complete_count,
      missing_count,
      needs_attention_count,
      not_applicable_count,
      completeness_percentage,
      category_breakdown,
      upcoming_reminders,
    };
  }
}
