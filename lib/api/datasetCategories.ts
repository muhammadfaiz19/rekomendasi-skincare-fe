import fetcher from './fetcher';
import { DatasetCategory, DatasetCategoryCreate, DatasetCategoryUpdate } from '@/types/dataset_category';

export const datasetCategoriesApi = {
  list: async () => {
    return fetcher<DatasetCategory[]>('/dataset-categories/');
  },

  get: async (id: number) => {
    return fetcher<DatasetCategory>(`/dataset-categories/${id}`);
  },

  create: async (data: DatasetCategoryCreate) => {
    return fetcher<DatasetCategory>('/dataset-categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: DatasetCategoryUpdate) => {
    return fetcher<DatasetCategory>(`/dataset-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetcher<void>(`/dataset-categories/${id}`, {
      method: 'DELETE',
    });
  },
};
