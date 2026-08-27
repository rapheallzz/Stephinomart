export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  image: string;
  category: string;
  stock: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface InventorySnapshot {
  [productId: string]: number;
}
