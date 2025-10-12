export interface Product {
  id: number;
  name: string;
  description?: string;
  excerpt?: string;
  keyBenefits: string[];
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}
