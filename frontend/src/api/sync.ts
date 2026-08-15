import { apiClient } from './client';
import { SyncOperation, SyncPushResponse, SyncPullResponse } from '../../../shared/types';

export const syncApi = {
  async push(operations: SyncOperation[]): Promise<SyncPushResponse> {
    const res = await apiClient.post<SyncPushResponse>('/sync/push', { operations });
    return res.data;
  },

  async pull(since?: string): Promise<SyncPullResponse> {
    const res = await apiClient.get<SyncPullResponse>('/sync/pull', {
      params: { since },
    });
    return res.data;
  },
};
