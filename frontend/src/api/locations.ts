import { apiClient } from './client';
import { Location } from '../../../shared/types';

export const locationsApi = {
  async list(): Promise<Location[]> {
    const res = await apiClient.get<{ locations: Location[] }>('/locations');
    return res.data.locations;
  },

  async create(data: Partial<Location>): Promise<Location> {
    const res = await apiClient.post<{ location: Location }>('/locations', data);
    return res.data.location;
  },

  async update(id: string, data: Partial<Location>): Promise<Location> {
    const res = await apiClient.put<{ location: Location }>(`/locations/${id}`, data);
    return res.data.location;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/locations/${id}`);
  },
};
