import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { LocationType } from '../../../shared/types';

export class LocationService {
  static async listLocations(userId: string) {
    const locations = await prisma.location.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return locations.map(l => ({
      ...l,
      type: l.type as LocationType,
      created_at: l.created_at.toISOString(),
      updated_at: l.updated_at.toISOString(),
      item_count: l._count.items,
    }));
  }

  static async createLocation(userId: string, data: any) {
    const location = await prisma.location.create({
      data: {
        user_id: userId,
        name: data.name.trim(),
        type: data.type,
        description: data.description || null,
        address: data.address || null,
        uri_template: data.uri_template || null,
      },
    });

    return {
      ...location,
      type: location.type as LocationType,
      created_at: location.created_at.toISOString(),
      updated_at: location.updated_at.toISOString(),
    };
  }

  static async updateLocation(userId: string, locationId: string, data: any) {
    const existing = await prisma.location.findFirst({
      where: { id: locationId, user_id: userId },
    });

    if (!existing) {
      throw new AppError('Location not found.', 404, 'LOCATION_NOT_FOUND');
    }

    const updated = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: data.name ? data.name.trim() : undefined,
        type: data.type || undefined,
        description: data.description !== undefined ? data.description : undefined,
        address: data.address !== undefined ? data.address : undefined,
        uri_template: data.uri_template !== undefined ? data.uri_template : undefined,
      },
    });

    return {
      ...updated,
      type: updated.type as LocationType,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
    };
  }

  static async deleteLocation(userId: string, locationId: string) {
    const existing = await prisma.location.findFirst({
      where: { id: locationId, user_id: userId },
    });

    if (!existing) {
      throw new AppError('Location not found.', 404, 'LOCATION_NOT_FOUND');
    }

    // Unlink items referencing this location
    await prisma.item.updateMany({
      where: { location_id: locationId },
      data: { location_id: null },
    });

    await prisma.location.delete({
      where: { id: locationId },
    });

    return { success: true };
  }
}
