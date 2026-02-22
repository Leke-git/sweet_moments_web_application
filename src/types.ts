export interface CakeType {
  id: string;
  name: string;
  base_price: number;
  emoji: string;
  photo: string;
  description: string;
}

export interface Size {
  id: string;
  label: string;
  servings: number;
  multiplier: number;
}

export interface Surcharges {
  delivery_fee: number;
  dietary_per_item: number;
  fondant_premium: number;
}

export interface SiteConfig {
  cake_types: CakeType[];
  sizes: Size[];
  cake_flavours: string[];
  fillings: string[];
  frosting_types: string[];
  colour_options: string[];
  dietary_options: string[];
  surcharges: Surcharges;
  delivery_enabled: boolean;
  min_days_notice: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface CakeItem {
  id: string;
  selectedCakeType: string;
  selectedSize: string;
  quantity: number;
  cakeFlavor: string;
  filling: string;
  frosting: string;
  customMessage: string;
  inspirationImage: string | null;
  inspirationMimeType: string | null;
  inspirationUrl: string;
  dietaryReqs: string[];
  mockupUrl?: string | null;
  mockupMatchesIdea?: boolean;
}

export interface OrderFormData {
  items: CakeItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: 'pickup' | 'delivery' | '';
  deliveryDate: string;
  deliveryAddress: string;
}

export interface EnquiryData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'replied';
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: 'pickup' | 'delivery' | '';
  delivery_date: string;
  delivery_address: string;
  items: CakeItem[];
  total_price: number;
  status: 'pending' | 'confirmed' | 'baking' | 'delivered' | 'cancelled';
  created_at: string;
}
