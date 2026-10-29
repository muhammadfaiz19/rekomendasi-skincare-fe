import fetcher from './fetcher';
import { Category } from '@/types/category';

export const categoriesApi = {
  list: async () => {
    const response = await fetcher<Category[]>('/categories');
    return response;
  },
  
  create: async (name: string) => {
    const response = await fetcher<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return response;
  },
  
  update: async (id: number, name: string) => {
    const response = await fetcher<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    return response;
  },
  
  delete: async (id: number) => {
    const response = await fetcher<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
