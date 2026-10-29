export type Product = {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  category_id: number;
  created_at: string;
};

export type ProductCreate = Omit<Product, 'id' | 'created_at'>;
export type ProductUpdate = Partial<ProductCreate>;
