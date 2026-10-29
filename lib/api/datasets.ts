import fetcher from './fetcher';
import { SkinDataset } from '@/types/dataset';

export const datasetsApi = {
  list: async (skip = 0, limit = 5000) => {
    return fetcher<SkinDataset[]>(`/datasets/?skip=${skip}&limit=${limit}`);
  },

  get: async (id: number) => {
    return fetcher<SkinDataset>(`/datasets/${id}`);
  },

  create: async (formData: FormData) => {
    return fetcher<SkinDataset>('/datasets/', {
      method: 'POST',
      body: formData,
    });
  },

  update: async (id: number, formData: FormData) => {
    return fetcher<SkinDataset>(`/datasets/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  delete: async (id: number) => {
    return fetcher<void>(`/datasets/${id}`, {
      method: 'DELETE',
    });
  },
};
