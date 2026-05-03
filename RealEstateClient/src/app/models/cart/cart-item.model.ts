export interface CartItem {
  productId: number;
  title: string;
  price: number;
  basePrice?: number; // מחיר בסיסי ללילה/חודש
  imageUrl: string;
  city: string;
  transactionType: string;
  startDate?: Date;
  endDate?: Date;
  quantity: number;
  ownerId?: number;
}
