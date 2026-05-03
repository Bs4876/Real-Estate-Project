import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CartService } from '../../services/cart-service';
import { UserService } from '../../services/user-service';
import { OrderService } from '../../services/order-service';
import { CartItem } from '../../models/cart/cart-item.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ButtonModule, RadioButtonModule, CheckboxModule, InputTextModule, InputMaskModule, DialogModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './checkout-component.html',
  styleUrl: './checkout-component.scss'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  paymentMethod: string = 'credit';
  isProcessing: boolean = false;
  acceptTerms: boolean = false;
  orderCompleted: boolean = false;
  
  // Credit card fields
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  
  // PayPal fields
  paypalEmail: string = '';
  
  // Success dialog
  showSuccessDialog: boolean = false;
  orderSuccess: boolean = false;
  orderMessage: string = '';
  orderId: number = 0;

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private orderService: OrderService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    
    this.cartService.getCart().subscribe(items => {
      if (items.length === 0 && !this.orderCompleted) {
        this.router.navigate(['/cart']);
        return;
      }
      if (items.length > 0) {
        this.cartItems = items;
      }
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      if (item.transactionType === 'מכירה') {
        return sum;
      }
      return sum + item.price;
    }, 0);
  }

  isFormValid(): boolean {
    if (!this.acceptTerms) return false;
    
    if (this.paymentMethod === 'credit') {
      return this.cardNumber.length > 0 && 
             this.cardName.length > 0 && 
             this.cardExpiry.length > 0 && 
             this.cardCvv.length > 0;
    } else {
      return this.paypalEmail.length > 0;
    }
  }

  completeOrder() {
    if (!this.isFormValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'אנא מלא את כל השדות ואשר את התקנון',
        life: 3000
      });
      return;
    }
    
    this.isProcessing = true;
    const currentUser = this.userService.getCurrentUser();
    
    if (!currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'משתמש לא מחובר',
        life: 3000
      });
      this.isProcessing = false;
      return;
    }

    const orderItems = this.cartItems.map((item, index) => {
      if (item.transactionType === 'מכירה') {
        return {
          productId: item.productId,
          priceAtPurchase: item.price,
          startDate: null,
          endDate: null
        };
      }
      return {
        productId: item.productId,
        priceAtPurchase: item.price,
        startDate: new Date(item.startDate!).toISOString(),
        endDate: new Date(item.endDate!).toISOString()
      };
    });

    const orderData = {
      userId: currentUser.userId,
      orderItems: orderItems,
      totalAmount: this.getTotalPrice()
    };

    // Simulate payment processing
    setTimeout(() => {
      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          this.cartService.clearCart();
          this.router.navigate(['/order-success'], { 
            queryParams: { 
              orderId: response.orderId || response.id || 0,
              success: true 
            } 
          });
        },
        error: (err) => {
          const errorMsg = err.error?.message || err.error || err.message || 'שגיאה ביצירת ההזמנה';
          this.messageService.add({
            severity: 'error',
            summary: 'שגיאה',
            detail: errorMsg,
            life: 4000
          });
          this.isProcessing = false;
        }
      });
    }, 1500);
  }
  
  goToOrders() {
    this.showSuccessDialog = false;
    this.router.navigate(['/profile'], { queryParams: { tab: 1 } });
  }
  
  continueShopping() {
    this.showSuccessDialog = false;
    this.router.navigate(['/products']);
  }

  goBack() {
    this.router.navigate(['/cart']);
  }
}
