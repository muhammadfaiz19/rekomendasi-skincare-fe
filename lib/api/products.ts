import fetcher from './fetcher';
import { Product, ProductCreate, ProductUpdate } from '@/types/product';

export const productsApi = {
  list: async () => {
    const response = await fetcher<Product[]>('/products');
    return response;
  },
  
  getOne: async (id: number) => {
    const response = await fetcher<Product>(`/products/${id}`);
    return response;
  },
  
  create: async (productData: ProductCreate) => {
    const response = await fetcher<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response;
  },
  
  update: async (id: number, productData: ProductUpdate) => {
    const response = await fetcher<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return response;
  },
  
  delete: async (id: number) => {
    const response = await fetcher<void>(`/products/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
