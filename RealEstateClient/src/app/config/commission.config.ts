export const COMMISSION_CONFIG = {
  SALE: {
    BUYER_RATE: 0.01,
    SELLER_RATE: 0.01,
    TOTAL_RATE: 0.02
  },
  RENT: {
    BUYER_RATE: 1.0,
    SELLER_RATE: 0,
    TOTAL_RATE: 1.0
  },
  VACATION: {
    BUYER_RATE: 0.03,
    SELLER_RATE: 0.05,
    TOTAL_RATE: 0.08
  }
};

export function calculateBuyerCommission(price: number, transactionType: string = 'Sale'): number {
  const type = transactionType.toUpperCase();
  const config = COMMISSION_CONFIG[type as keyof typeof COMMISSION_CONFIG] || COMMISSION_CONFIG.SALE;
  return price * config.BUYER_RATE;
}

export function calculateSellerCommission(price: number, transactionType: string = 'Sale'): number {
  const type = transactionType.toUpperCase();
  const config = COMMISSION_CONFIG[type as keyof typeof COMMISSION_CONFIG] || COMMISSION_CONFIG.SALE;
  return price * config.SELLER_RATE;
}

export function calculateTotalPrice(price: number, transactionType: string = 'Sale'): number {
  return price + calculateBuyerCommission(price, transactionType);
}

export function calculateSellerReceives(price: number, transactionType: string = 'Sale'): number {
  return price - calculateSellerCommission(price, transactionType);
}

export function getCommissionText(transactionType: string): string {
  const type = transactionType.toUpperCase();
  switch(type) {
    case 'SALE':
      return 'מכירה: 1% מהמוכר + 1% מהקונה = 2% סה"כ (חד פעמי)';
    case 'RENT':
      return 'השכרה: חודש שכירות שלם מהשוכר (חד פעמי בתחילת השכירות)';
    case 'VACATION':
      return 'נופש: 5% מהמשכיר + 3% מהשוכר = 8% סה"כ (מכל הזמנה)';
    default:
      return '';
  }
}
