import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartVisibleSubject = new BehaviorSubject<boolean>(false);
  private lastShowTime = 0;

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  addToCart(cartItem: CartItem) {
    // במכירה - לא לאפשר להוסיף את אותו מוצר פעמיים
    if (cartItem.transactionType === 'מכירה') {
      const exists = this.cartItems.find(item => 
        item.productId === cartItem.productId && item.transactionType === 'מכירה'
      );
      if (exists) {
        alert('מוצר זה כבר קיים בסל');
        return;
      }
    }
    // בהשכרה/נופש - בדיקה שאין חפיפה בתאריכים
    else {
      const overlapping = this.cartItems.find(item => 
        item.productId === cartItem.productId &&
        item.startDate && item.endDate && cartItem.startDate && cartItem.endDate &&
        this.datesOverlap(item.startDate, item.endDate, cartItem.startDate, cartItem.endDate)
      );
      if (overlapping) {
        alert('אין אפשרות להוסיף את אותו מוצר עם תאריכים חופפים');
        return;
      }
    }
    this.cartItems.push(cartItem);
    this.saveCart();
  }

  private datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();
    return s1 <= e2 && s2 <= e1;
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
  }

  getCart() {
    return this.cartSubject.asObservable();
  }

  getCartVisible() {
    return this.cartVisibleSubject.asObservable();
  }

  showCart() {
    const now = Date.now();
    if (now - this.lastShowTime < 1000) return;
    this.lastShowTime = now;
    this.cartVisibleSubject.next(true);
  }

  hideCart() {
    this.cartVisibleSubject.next(false);
  }

  getCartCount(): number {
    return this.cartItems.length;
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  updateCart() {
    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }
}