export type Category = 
  | 'Doces Artesanais' 
  | 'Bolos' 
  | 'Tortas' 
  | 'Geladinho' 
  | 'Pipocas Gourmet';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string; // WhatsApp phone number, e.g. "18991179602"
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  priceAtSale: number;
  quantity: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO String
  items: SaleItem[];
  totalAmount: number;
  status: 'pago' | 'fiado';
  paidAt?: string; // ISO String when marked as paid
}

export interface CartItem {
  product: Product;
  quantity: number;
}
