import { OrderItemModel } from '../order-item/order-item-model';
import { OrderItemDTOModel } from '../order-item/order-item-model';
import { OrderItemViewDTOModel } from '../order-item/order-item-model';

export class Order {
  orderId: number = 0;
  userId: number = 0;
  orderDate?: Date;
  totalAmount: number = 0;
  status: string = 'Pending';
  orderItems: OrderItemModel[] = [];
}

export class OrderCreateDTOModel {
    userId: number = 0;
    orderItems: OrderItemDTOModel[] = [];
    totalAmount: number = 0;
}

export class OrderHistoryDTOModel {
    orderId: number = 0;
    orderDate: Date = new Date();
    totalAmount: number = 0;
    status: string = '';
    orderItems: OrderItemViewDTOModel[] = [];
}

export class OrderStatusUpdateDTOModel {
    orderId: number = 0;
    status: string = '';
}

export class OccupiedDatesResponseDTOModel {
    productId: number = 0;
    month: number = 0;
    year: number = 0;
    occupiedDates: string[] = [];
}
