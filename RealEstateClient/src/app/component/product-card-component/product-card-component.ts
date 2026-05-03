import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { ProductSummaryDTOModel } from '../../models/product/product-model';
import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';
import { FavoritesService } from '../../services/favorites-service';
import { OrderService } from '../../services/order-service';
import { PropertyInquiryService } from '../../services/property-inquiry-service';
import { CartItem } from '../../models/cart/cart-item.model';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../../services/product-service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { calculateBuyerCommission, calculateTotalPrice } from '../../config/commission.config';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ValidationUtils } from '../../utils/validation.utils';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, DialogModule, DatePickerModule, FormsModule, InputTextModule],
  templateUrl: './product-card-component.html',
  styleUrl: './product-card-component.scss'
})
export class ProductCardComponent implements OnInit, OnChanges {
  @Input() product!: ProductSummaryDTOModel;
  imageUrl: string = '';
  showDetailsDialog: boolean = false;
  showRatingDialog: boolean = false;
  showContactDialog: boolean = false;
  ownerDetails: any = null;
  contactForm = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };
  emailError: string = '';
  phoneError: string = '';
  selectedRating: number = 0;
  hoverRating: number = 0;
  productDetails: any = null;
  selectedDates: Date[] | undefined;
  minDate: Date = new Date();
  disabledDates: Date[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  availabilityMessage: string = '';
  isRangeAvailable: boolean = false;

  constructor(
    private router: Router, 
    private userService: UserService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private productService: ProductService,
    private orderService: OrderService,
    private propertyInquiryService: PropertyInquiryService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.updateImageUrl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && this.product) {
      this.updateImageUrl();
      this.cdr.detectChanges();
    }
  }

  updateImageUrl() {
    if (this.product && this.product.imageUrl) {
      this.imageUrl = this.getFullImageUrl(this.product.imageUrl);
    }
  }

  get isMyProduct(): boolean {
    const currentUser = this.userService.getCurrentUser();
    return !!(currentUser && this.product.ownerId === currentUser.userId);
  }

  addToCart(product: any) {
    if (this.isVacationType()) {
      this.loadProductDetails();
    } else {
      this.openContactDialog();
    }
  }

  loadProductDetails() {
    this.productService.getProductById(this.product.productId).subscribe({
      next: (data) => {
        // נרמול השדה transactionType
        if (data.transactionType && !data.TransactionType) {
          data.TransactionType = data.transactionType === 'נופש' ? 'Vacation' : 
                                 data.transactionType === 'מכירה' ? 'Sale' : 
                                 data.transactionType === 'השכרה' ? 'Rent' : data.transactionType;
        }
        this.productDetails = data;
        this.showDetailsDialog = true;
        if (this.productDetails.TransactionType === 'Vacation') {
          this.loadOccupiedDates();
        }
      },
      error: (err) => { /* Error handled */ } });
  }

  loadOccupiedDates(month?: number, year?: number) {
    const targetMonth = month || this.currentMonth + 1;
    const targetYear = year || this.currentYear;
    
    this.orderService.getOccupiedDates(this.product.productId, targetMonth, targetYear)
      .subscribe({
        next: (data) => {
          this.disabledDates = data.occupiedDates.map(dateStr => new Date(dateStr));
          this.cdr.detectChanges();
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
      if (this.product.TransactionType === 'השכרה' || this.product.TransactionType === 'Rent') {
        if (!this.isFullMonths(dates[0], dates[1])) {
          this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
          this.isRangeAvailable = false;
          setTimeout(() => {
            this.selectedDates = undefined;
            this.cdr.detectChanges();
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

  checkRangeAvailability(startDate: Date, endDate: Date) {
    if (this.product.TransactionType === 'השכרה' || this.product.TransactionType === 'Rent') {
      if (!this.isFullMonths(startDate, endDate)) {
        this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
        this.isRangeAvailable = false;
        setTimeout(() => {
          this.selectedDates = undefined;
          this.cdr.detectChanges();
        }, 2000);
        return;
      }
    }
    
    this.productService.checkAvailability(this.product.productId, startDate, endDate)
      .subscribe({
        next: (isAvailable) => {
          this.isRangeAvailable = isAvailable;
          if (isAvailable) {
            this.availabilityMessage = '✓ התאריכים זמינים להזמנה!';
          } else {
            this.availabilityMessage = '✗ התאריכים לא זמינים - יש חפיפה עם תאריכים תפוסים';
            setTimeout(() => {
              this.selectedDates = undefined;
              this.cdr.detectChanges();
            }, 100);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.availabilityMessage = 'שגיאה בבדיקת זמינות';
          this.isRangeAvailable = false;
          this.selectedDates = undefined;
        }
      });
  }

  addToCartWithDates() {
    if (this.selectedDates && this.selectedDates[0] && this.selectedDates[1] && this.isRangeAvailable) {
      const basePrice = this.product.price;
      const nights = this.calculateNights(this.selectedDates[0], this.selectedDates[1]);
      const totalBeforeCommission = basePrice * nights;
      const finalPrice = calculateTotalPrice(totalBeforeCommission, 'Vacation');
      
      const cartItem: CartItem = {
        productId: this.product.productId,
        title: this.product.title,
        price: finalPrice,
        basePrice: basePrice,
        imageUrl: this.imageUrl,
        city: this.product.city,
        transactionType: this.product.TransactionType,
        startDate: this.selectedDates[0],
        endDate: this.selectedDates[1],
        quantity: 1
      };
      this.showDetailsDialog = false;
      this.selectedDates = undefined;
      this.productDetails = null;
      this.disabledDates = [];
      this.availabilityMessage = '';
      this.isRangeAvailable = false;
      this.cartService.addToCart(cartItem);
      this.cartService.showCart();
    }
  }

  isFullMonths(start: Date, end: Date): boolean {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // בדיקה שהיום בחודש זהה
    if (startDate.getDate() !== endDate.getDate()) {
      return false;
    }
    
    // חישוב הפרש בחודשים
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth());
    
    return monthsDiff >= 1;
  }

  calculateMonths(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months += endDate.getMonth() - startDate.getMonth();
    
    return months;
  }

  calculateNights(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onDialogHide() {
    this.showDetailsDialog = false;
    this.selectedDates = undefined;
    this.productDetails = null;
    this.disabledDates = [];
    this.availabilityMessage = '';
    this.isRangeAvailable = false;
  }

  editProduct() {
    this.router.navigate(['/edit-product', this.product.productId], { queryParams: { returnTo: 'products' } });
  }

  // פונקציית המעבר לדף פרטים נוספים
  viewDetails(productId: number) {
    const currentUrl = this.router.url;
    let returnTo = '/products';
    
    if (currentUrl.includes('/favorites')) {
      returnTo = '/favorites';
    } else if (currentUrl.includes('/profile')) {
      returnTo = '/profile';
    }
    
    this.router.navigate(['/product-details', productId], { queryParams: { returnTo } });
  }

  getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    // אם זה כבר URL מלא
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // אם זה נתיב יחסי, הוסף את כתובת השרת
    const serverUrl = 'https://localhost:44305';
    return serverUrl + '/' + imageUrl;
  }

  getCommissionRate(): string {
    const type = this.product?.TransactionType;
    switch(type) {
      case 'Sale': 
      case 'מכירה': return '1%';
      case 'Rent':
      case 'השכרה': return 'חודש שלם';
      case 'Vacation':
      case 'נופש': return '3%';
      default: return '2%';
    }
  }

  getBuyerCommission(): number {
    if (!this.productDetails) return 0;
    const type = this.productDetails.TransactionType === 'Sale' || this.productDetails.TransactionType === 'מכירה' ? 'Sale' : 
                 this.productDetails.TransactionType === 'Rent' || this.productDetails.TransactionType === 'השכרה' ? 'Rent' : 'Vacation';
    return calculateBuyerCommission(this.productDetails.price, type);
  }

  getTotalPrice(): number {
    if (!this.productDetails) return 0;
    const type = this.productDetails.TransactionType === 'Sale' || this.productDetails.TransactionType === 'מכירה' ? 'Sale' : 
                 this.productDetails.TransactionType === 'Rent' || this.productDetails.TransactionType === 'השכרה' ? 'Rent' : 'Vacation';
    return calculateTotalPrice(this.productDetails.price, type);
  }

  getTransactionTypeLabel(type: string): string {
    if (!type) return '';
    switch(type.toLowerCase()) {
      case 'sale': return 'מכירה';
      case 'rent': return 'השכרה';
      case 'vacation': return 'נופש';
      default: return type;
    }
  }

  isSaleType(): boolean {
    return this.product?.TransactionType === 'Sale' || this.product?.TransactionType === 'מכירה';
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product.productId);
  }

  isVacationType(): boolean {
    const product: any = this.product;
    const type = product?.TransactionType?.toLowerCase() || product?.transactionType?.toLowerCase();
    const result = type === 'vacation' || type === 'נופש';
    return result;
  }

  addToFavorites(product: any) {
    this.selectedRating = 0;
    this.hoverRating = 0;
    this.showRatingDialog = true;
  }

  submitRating() {
    if (this.selectedRating === 0) {
      return;
    }
    
    const wasAdded = this.favoritesService.addToFavorites({
      productId: this.product.productId,
      title: this.product.title,
      price: this.product.price,
      imageUrl: this.imageUrl,
      city: this.product.city,
      TransactionType: this.product.TransactionType,
      description: '',
      categoryId: this.product.categoryId,
      ownerId: this.product.ownerId,
      isAvailable: true,
      productImages: [],
      rating: this.selectedRating
    });
    
    this.showRatingDialog = false;
    
    if (wasAdded) {
      this.favoritesService.showFavorites();
      this.messageService.add({
        severity: 'success',
        summary: 'נוסף למועדפים',
        detail: 'המוצר נוסף בהצלחה למועדפים'
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'כבר קיים',
        detail: 'המוצר כבר נמצא במועדפים'
      });
    }
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  openContactDialog() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.contactForm.name = currentUser.fullName || '';
      this.contactForm.phone = currentUser.phone || '';
      this.contactForm.email = currentUser.email || '';
    }
    
    if (this.product?.ownerId) {
      this.userService.getUserById(this.product.ownerId).subscribe({
        next: (owner) => {
          this.ownerDetails = owner;
          this.showContactDialog = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showContactDialog = true;
        }
      });
    } else {
      this.showContactDialog = true;
    }
  }

  submitContactForm() {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'נדרשת התחברות',
        detail: 'יש להתחבר כדי ליצור קשר'
      });
      return;
    }

    if (!this.product.ownerId) {
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'לא נמצא בעל הנכס'
      });
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

    const inquiry = {
      productId: this.product.productId,
      userId: currentUser.userId,
      ownerId: this.product.ownerId,
      name: this.contactForm.name,
      phone: this.contactForm.phone,
      email: this.contactForm.email,
      message: this.contactForm.message
    };

    this.propertyInquiryService.createInquiry(inquiry).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'נשלח בהצלחה',
          detail: 'הפנייה נשלחה למפרסם'
        });
        this.showContactDialog = false;
        this.contactForm = { name: '', phone: '', email: '', message: '' };
        this.emailError = '';
        this.phoneError = '';
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: 'שגיאה בשליחת הפנייה'
        });
      }
    });
  }
}