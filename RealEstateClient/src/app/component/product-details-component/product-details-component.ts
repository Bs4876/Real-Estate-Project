import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { OrderService } from '../../services/order-service';
import { CartService } from '../../services/cart-service';
import { FavoritesService } from '../../services/favorites-service';
import { UserService } from '../../services/user-service';
import { PropertyInquiryService } from '../../services/property-inquiry-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { calculateBuyerCommission, calculateTotalPrice } from '../../config/commission.config';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ValidationUtils } from '../../utils/validation.utils';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, GalleriaModule, DatePickerModule, FormsModule, DialogModule, InputTextModule, TooltipModule],
  templateUrl: './product-details-component.html',
  styleUrl: './product-details-component.scss'
})
export class ProductDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() productId: number | null = null;
  @Input() isEmbedded: boolean = false;
  
  product: any = null;
  images: any[] = [];
  activeIndex: number = 0;
  showLightbox: boolean = false;
  zoomLevel: number = 1;

  rangeDates: Date[] | undefined;
  minDate: Date = new Date();
  disabledDates: Date[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  availabilityMessage: string = '';
  isRangeAvailable: boolean = false;
  returnUrl: string = '/products';
  returnTab: number = 0;
  
  showRatingDialog: boolean = false;
  selectedRating: number = 0;
  hoverRating: number = 0;
  
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
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private userService: UserService,
    private propertyInquiryService: PropertyInquiryService,
    private cdr: ChangeDetectorRef,
    private injector: Injector,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (!this.isEmbedded) {
      const sub = this.route.queryParams.subscribe(params => {
        if (params['returnTo'] === 'profile') {
          this.returnUrl = '/profile';
          this.returnTab = params['tab'] ? +params['tab'] : 0;
        } else if (params['returnTo'] === 'favorites') {
          this.returnUrl = '/favorites';
        } else if (params['returnTo']) {
          this.returnUrl = params['returnTo'];
        }
        if (params['openContact'] === 'true') {
          setTimeout(() => this.openContactDialog(), 500);
        }
      });
      this.subscriptions.push(sub);
      
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    } else if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId && this.isEmbedded) {
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        // נרמול השדה transactionType
        if (data.transactionType && !data.TransactionType) {
          data.TransactionType = data.transactionType === 'נופש' ? 'Vacation' : 
                                 data.transactionType === 'מכירה' ? 'Sale' : 
                                 data.transactionType === 'השכרה' ? 'Rent' : data.transactionType;
        }
        
        this.product = data;
        this.setupGallery(data);
        if (data.TransactionType === 'Vacation') {
          this.loadOccupiedDates();
        } else {
          }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.product = null;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    if (this.returnUrl === '/profile') {
      this.router.navigate([this.returnUrl], { queryParams: { tab: this.returnTab } });
    } else if (this.returnUrl === '/favorites') {
      this.router.navigate(['/favorites']);
    } else {
      this.router.navigate([this.returnUrl]);
    }
  }

  setupGallery(data: any) {
    const serverUrl = 'https://localhost:44305';
    const timestamp = '?t=' + Date.now();
    const mainImageUrl = data.imageUrl.startsWith('http') ? data.imageUrl + timestamp : serverUrl + data.imageUrl + timestamp;
    
    this.images = [{ itemImageSrc: mainImageUrl, thumbnailImageSrc: mainImageUrl }];
    if (data.productImages && data.productImages.length > 0) {
      data.productImages.forEach((img: any) => {
        const additionalImageUrl = img.additionalImageUrl.startsWith('http') ? img.additionalImageUrl + timestamp : serverUrl + img.additionalImageUrl + timestamp;
        this.images.push({ 
          itemImageSrc: additionalImageUrl, 
          thumbnailImageSrc: additionalImageUrl 
        });
      });
    }
  }

  loadOccupiedDates(month?: number, year?: number) {
    const targetMonth = month || this.currentMonth + 1;
    const targetYear = year || this.currentYear;
    
    this.orderService.getOccupiedDates(this.product.productId, targetMonth, targetYear)
      .subscribe({
        next: (data) => {
          this.disabledDates = data.occupiedDates.map(dateStr => {
            const date = new Date(dateStr);
            return date;
          });
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
      if (this.product && (this.product.TransactionType === 'Rent' || this.product.TransactionType === 'השכרה')) {
        if (!this.isFullMonths(dates[0], dates[1])) {
          this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
          this.isRangeAvailable = false;
          setTimeout(() => {
            this.rangeDates = undefined;
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

  checkRangeAvailability(startDate: Date, endDate: Date) {
    this.productService.checkAvailability(this.product.productId, startDate, endDate)
      .subscribe({
        next: (isAvailable) => {
          this.isRangeAvailable = isAvailable;
          if (isAvailable) {
            this.availabilityMessage = '✓ התאריכים זמינים להזמנה!';
            } else {
            this.availabilityMessage = '✗ התאריכים לא זמינים - יש חפיפה עם תאריכים תפוסים';
            setTimeout(() => {
              this.rangeDates = undefined;
              this.cdr.detectChanges();
            }, 100);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.availabilityMessage = 'שגיאה בבדיקת זמינות';
          this.isRangeAvailable = false;
          this.rangeDates = undefined;
        }
      });
  }

  onImageChange(index: number) {
    this.activeIndex = index;
    this.cdr.detectChanges();
  }

  openLightbox(index: number) {
    this.activeIndex = index;
    this.showLightbox = true;
    this.zoomLevel = 1;
  }

  closeLightbox() {
    this.showLightbox = false;
    this.zoomLevel = 1;
  }

  zoomIn() {
    if (this.zoomLevel < 3) {
      this.zoomLevel += 0.5;
    }
  }

  zoomOut() {
    if (this.zoomLevel > 1) {
      this.zoomLevel -= 0.5;
    }
  }

  nextImage() {
    this.activeIndex = (this.activeIndex + 1) % this.images.length;
    this.cdr.detectChanges();
  }

  previousImage() {
    this.activeIndex = this.activeIndex === 0 ? this.images.length - 1 : this.activeIndex - 1;
    this.cdr.detectChanges();
  }

  isRentType(): boolean {
    const type = this.product?.TransactionType?.toLowerCase() || this.product?.transactionType?.toLowerCase();
    const result = type === 'vacation' || type === 'נופש' || type === 'rent' || type === 'השכרה';
    return result;
  }

  isSaleOrLongTermRent(): boolean {
    return this.product?.TransactionType === 'Sale' || this.product?.TransactionType === 'Rent';
  }

  isFavorite(): boolean {
    return this.product ? this.favoritesService.isFavorite(this.product.productId) : false;
  }

  toggleFavorite(): void {
    if (!this.product) return;
    
    if (this.isFavorite()) {
      this.favoritesService.removeFromFavorites(this.product.productId);
      this.messageService.add({
        severity: 'success',
        summary: 'הוסר',
        detail: 'המוצר הוסר מהמועדפים'
      });
    } else {
      this.selectedRating = 0;
      this.hoverRating = 0;
      this.showRatingDialog = true;
    }
    this.cdr.detectChanges();
  }

  submitRating() {
    if (this.selectedRating === 0 || !this.product) {
      return;
    }
    
    const productWithRating = { ...this.product, rating: this.selectedRating };
    const wasAdded = this.favoritesService.addToFavorites(productWithRating);
    
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
    this.cdr.detectChanges();
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  canAddToCart(): boolean {
    if (!this.product) {
      return false;
    }
    
    if (this.product.TransactionType === 'Sale') {
      return true;
    }
    
    const canAdd = !!(this.rangeDates && this.rangeDates[0] && this.rangeDates[1] && this.isRangeAvailable);
    return canAdd;
  }

  addToCart() {
    let finalPrice = this.product.price;
    
    // חישוב מחיר לפי סוג עסקה
    if (this.rangeDates && this.rangeDates[0] && this.rangeDates[1]) {
      if (this.product.TransactionType === 'Vacation') {
        const nights = this.calculateNights(this.rangeDates[0], this.rangeDates[1]);
        finalPrice = this.product.price * nights;
        finalPrice = calculateTotalPrice(finalPrice, 'Vacation');
      } else if (this.product.TransactionType === 'Rent') {
        const months = this.calculateMonths(this.rangeDates[0], this.rangeDates[1]);
        finalPrice = this.product.price * (months + 1);
      }
    }
    
    const cartItem = {
      productId: this.product.productId,
      title: this.product.title,
      price: finalPrice,
      basePrice: this.product.price,
      imageUrl: this.product.imageUrl,
      city: this.product.city,
      transactionType: this.product.TransactionType === 'Sale' ? 'מכירה' : 
                       this.product.TransactionType === 'Rent' ? 'השכרה' : 'נופש',
      startDate: this.rangeDates?.[0],
      endDate: this.rangeDates?.[1],
      quantity: 1
    };
    
    this.cartService.addToCart(cartItem);
    this.cartService.showCart();
  }

  getBuyerCommission(): number {
    return calculateBuyerCommission(this.product?.price || 0, this.product?.TransactionType || 'Sale');
  }

  getTotalPrice(): number {
    return calculateTotalPrice(this.product?.price || 0, this.product?.TransactionType || 'Sale');
  }

  getCommissionRate(): string {
    const type = this.product?.TransactionType?.toUpperCase();
    switch(type) {
      case 'SALE': return '1%';
      case 'RENT': return 'חודש שלם';
      case 'VACATION': return '3%';
      default: return '2%';
    }
  }

  isOwner(): boolean {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !this.product) return false;
    return this.product.ownerId === currentUser.userId;
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
