import { apiClient } from './client';
import { Item, ItemFilterParams, ItemListResponse, LifeStats } from '../../../shared/types';

export const itemsApi = {
  async list(params: ItemFilterParams): Promise<ItemListResponse> {
    const res = await apiClient.get<ItemListResponse>('/items', { params });
    return res.data;
  },

  async getById(id: string): Promise<Item> {
    const res = await apiClient.get<{ item: Item }>(`/items/${id}`);
    return res.data.item;
  },

  async create(data: Partial<Item>): Promise<Item> {
    const res = await apiClient.post<{ item: Item }>('/items', data);
    return res.data.item;
  },

  async update(id: string, data: Partial<Item>): Promise<Item> {
    const res = await apiClient.put<{ item: Item }>(`/items/${id}`, data);
    return res.data.item;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  },

  async markReviewed(id: string): Promise<Item> {
    const res = await apiClient.post<{ item: Item }>(`/items/${id}/review`);
    return res.data.item;
  },

  async getStats(): Promise<LifeStats> {
    const res = await apiClient.get<LifeStats>('/items/stats');
    return res.data;
  },
};
