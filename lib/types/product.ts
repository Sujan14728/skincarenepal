export interface Product {
  id: number;
  name: string;
  description?: string | null;
  excerpt?: string;
  keyBenefits: string[];
  keyIngredients: string[];
  howToUse: string[];
  suitableFor: string[];
  price: number;
  salePrice?: number | null;
  stock: number;
  images: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
