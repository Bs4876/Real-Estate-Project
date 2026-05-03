export class OrderItemModel {
  orderItemId: number = 0;
  orderId: number = 0;
  productId: number = 0;
  priceAtPurchase: number = 0;
}

export class OrderItemDTOModel {
    productId: number = 0;
    priceAtPurchase: number = 0;
    startDate?: Date;
    endDate?: Date;
}

export class OrderItemViewDTOModel {
    productId: number = 0;
    priceAtPurchase: number = 0;
    product?: { imageUrl: string; title: string }; 
    startDate?: Date;
    endDate?: Date;
}