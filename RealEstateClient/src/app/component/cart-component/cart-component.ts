import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { UserService } from '../../services/user-service';
import { ProductService } from '../../services/product-service';
import { OrderService } from '../../services/order-service';
import { MessageService } from 'primeng/api';
import { CartItem } from '../../models/cart/cart-item.model';
import { calculateTotalPrice } from '../../config/commission.config';
import { ValidationUtils } from '../../utils/validation.utils';

@Component({
  selector: 'app-cart-component',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, DatePickerModule, InputTextModule, FormsModule],
  providers: [MessageService],
  templateUrl: './cart-component.html',
  styleUrl: './cart-component.scss',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  showDateDialog: boolean = false;
  showContactDialog: boolean = false;
  selectedItem: CartItem | null = null;
  contactProduct: CartItem | null = null;
  ownerDetails: any = null;
  contactForm = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };
  emailError: string = '';
  phoneError: string = '';
  selectedDates: Date[] | undefined;
  minDate: Date = new Date();
  disabledDates: Date[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  availabilityMessage: string = '';
  isRangeAvailable: boolean = false;
  discountCode: string = '';
  discountAmount: number = 0;
  discountMessage: string = '';

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
    });
  }

  removeItem(productId: number) {
    const item = this.cartItems.find(i => i.productId === productId);
    if (item) {
      const element = document.querySelector(`[data-product-id="${productId}"]`);
      if (element) {
        element.classList.add('removing');
        setTimeout(() => {
          this.cartService.removeFromCart(productId);
        }, 300);
      } else {
        this.cartService.removeFromCart(productId);
      }
    }
  }

  editDates(item: CartItem) {
    this.selectedItem = item;
    if (item.startDate && item.endDate) {
      this.selectedDates = [new Date(item.startDate), new Date(item.endDate)];
    }
    this.showDateDialog = true;
    this.loadOccupiedDates();
  }

  loadOccupiedDates(month?: number, year?: number) {
    if (!this.selectedItem) return;
    
    const targetMonth = month || this.currentMonth + 1;
    const targetYear = year || this.currentYear;
    
    this.orderService.getOccupiedDates(this.selectedItem.productId, targetMonth, targetYear)
      .subscribe({
        next: (data) => {
          this.disabledDates = data.occupiedDates.map(dateStr => new Date(dateStr));
        },
        error: (err) => { /* Error handled */ } });
  }

  onMonthChange(event: any) {
    this.currentMonth = event.month;
    this.currentYear = event.year;
    this.loadOccupiedDates(event.month + 1, event.year);
  }

  onDateChange(dates: Date[] | undefined) {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      // בדיקה להשכרה - רק חודשים שלמים
      if (this.selectedItem && this.selectedItem.transactionType === 'השכרה') {
        if (!this.isFullMonths(dates[0], dates[1])) {
          this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
          this.isRangeAvailable = false;
          setTimeout(() => {
            this.selectedDates = undefined;
          }, 2000);
          return;
        }
      }
      this.checkRangeAvailability(dates[0], dates[1]);
    } else {
      this.availabilityMessage = '';
      this.isRangeAvailable = false;
    }
  }

  isFullMonths(start: Date, end: Date): boolean {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.getDate() !== endDate.getDate()) {
      return false;
    }
    
    // חישוב הפרש בחודשים
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth());
    
    const result = monthsDiff >= 1;
    return result;
  }

  checkRangeAvailability(startDate: Date, endDate: Date) {
    if (!this.selectedItem) return;
    
    // בדיקה להשכרה - חודשים שלמים
    if (this.selectedItem.transactionType === 'השכרה') {
      if (!this.isFullMonths(startDate, endDate)) {
        this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
        this.isRangeAvailable = false;
        setTimeout(() => {
          this.selectedDates = undefined;
        }, 2000);
        return;
      }
    }
    
    this.productService.checkAvailability(this.selectedItem.productId, startDate, endDate)
      .subscribe({
        next: (isAvailable) => {
          this.isRangeAvailable = isAvailable;
          if (isAvailable) {
            this.availabilityMessage = '✓ התאריכים זמינים להזמנה!';
          } else {
            this.availabilityMessage = '✗ התאריכים לא זמינים - יש חפיפה עם תאריכים תפוסים';
            setTimeout(() => {
              this.selectedDates = undefined;
            }, 100);
          }
        },
        error: (err) => {
          this.availabilityMessage = 'שגיאה בבדיקת זמינות';
          this.isRangeAvailable = false;
          this.selectedDates = undefined;
        }
      });
  }

  saveDates() {
    if (this.selectedItem && this.selectedDates && this.selectedDates[0] && this.selectedDates[1] && this.isRangeAvailable) {
      this.selectedItem.startDate = this.selectedDates[0];
      this.selectedItem.endDate = this.selectedDates[1];
      
      const basePrice = this.selectedItem.basePrice || 0;
      const nights = this.calculateNights(this.selectedDates[0], this.selectedDates[1]);
      const totalBeforeCommission = basePrice * nights;
      const finalPrice = calculateTotalPrice(totalBeforeCommission, 'Vacation');
      
      this.selectedItem.price = finalPrice;
      this.cartService.updateCart();
      this.closeDateDialog();
    }
  }

  closeDateDialog() {
    this.showDateDialog = false;
    this.selectedItem = null;
    this.selectedDates = undefined;
    this.disabledDates = [];
    this.availabilityMessage = '';
    this.isRangeAvailable = false;
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      if (item.transactionType === 'מכירה') {
        return sum;
      }
      return sum + item.price;
    }, 0);
  }

  getSubtotal(): number {
    return this.getTotalPrice();
  }

  getFinalPrice(): number {
    return this.getSubtotal() - this.discountAmount;
  }

  applyDiscount() {
    if (!this.discountCode.trim()) {
      this.discountMessage = 'אנא הכנס קוד הנחה';
      return;
    }
    
    const validCodes: {[key: string]: number} = {
      'SAVE10': 10,
      'SAVE20': 20,
      'DISCOUNT50': 50
    };
    
    const discount = validCodes[this.discountCode.toUpperCase()];
    if (discount) {
      this.discountAmount = (this.getSubtotal() * discount) / 100;
      this.discountMessage = `✓ קוד הנחה הוחל בהצלחה! ${discount}% הנחה`;
    } else {
      this.discountAmount = 0;
      this.discountMessage = '✗ קוד לא קיים או לא תקין';
    }
  }

  removeDiscount() {
    this.discountCode = '';
    this.discountAmount = 0;
    this.discountMessage = '';
  }

  calculateNights(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateMonths(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();
    return months;
  }

  getItemBasePrice(item: CartItem): number {
    if (item.transactionType === 'מכירה') {
      return 0;
    }
    return item.basePrice || item.price;
  }

  getItemTotalWithoutCommission(item: CartItem): number {
    if (!item.startDate || !item.endDate || !item.basePrice) {
      return item.price;
    }
    const nights = this.calculateNights(item.startDate, item.endDate);
    return item.basePrice * nights;
  }

  getItemPeriod(item: CartItem): string {
    if (item.transactionType === 'נופש' && item.startDate && item.endDate) {
      return `${this.calculateNights(item.startDate, item.endDate)} לילות`;
    }
    if (item.transactionType === 'השכרה' && item.startDate && item.endDate) {
      return `${this.calculateMonths(item.startDate, item.endDate)} חודשים`;
    }
    return '';
  }

  checkout() {
    if (!this.userService.isLoggedIn()) {
      localStorage.setItem('returnUrl', '/checkout');
      this.router.navigate(['/auth']);
      return;
    }
    
    const invalidItems = this.cartItems.filter(item => 
      item.transactionType !== 'מכירה' && (!item.startDate || !item.endDate)
    );
    
    if (invalidItems.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'חסרים תאריכים',
        detail: 'יש מוצרים ללא תאריכים. אנא בחר תאריכים לכל המוצרים.',
        life: 4000
      });
      return;
    }
    
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  openContactDialog(item: CartItem) {
    this.contactProduct = item;
    this.showContactDialog = true;
    if (item.ownerId) {
      this.userService.getUserById(item.ownerId).subscribe({
        next: (owner) => {
          this.ownerDetails = owner;
        },
        error: (err) => { /* Error handled */ } });
    }
  }

  submitContactForm() {
    if (!this.contactForm.name || !this.contactForm.phone || !this.contactForm.email) {
      return;
    }
    
    if (!ValidationUtils.isValidEmail(this.contactForm.email)) {
      this.emailError = 'כתובת אימייל לא תקינה';
      return;
    }
    
    if (!ValidationUtils.isValidPhone(this.contactForm.phone)) {
      this.phoneError = 'מספר טלפון לא תקין (פורמט: 0XX-XXXXXXX)';
      return;
    }
    
    this.messageService.add({
      severity: 'success',
      summary: 'הצלחה',
      detail: 'הפנייה נשלחה בהצלחה! ניצור איתך קשר בהקדם'
    });
    
    this.showContactDialog = false;
    this.contactForm = { name: '', phone: '', email: '', message: '' };
    this.emailError = '';
    this.phoneError = '';
    this.contactProduct = null;
    this.ownerDetails = null;
  }
}
