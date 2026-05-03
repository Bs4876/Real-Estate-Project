import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FavoritesService } from '../../services/favorites-service';
import { PropertyInquiryService } from '../../services/property-inquiry-service';
import { UserService } from '../../services/user-service';
import { ProductModel } from '../../models/product/product-model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ValidationUtils } from '../../utils/validation.utils';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, DialogModule, TooltipModule, FormsModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './favorites-component.html',
  styleUrl: './favorites-component.scss'
})
export class FavoritesComponent implements OnInit {
  favorites: ProductModel[] = [];
  showEditRatingDialog: boolean = false;
  editingProduct: ProductModel | null = null;
  selectedRating: number = 0;
  hoverRating: number = 0;
  
  showContactDialog: boolean = false;
  contactProduct: ProductModel | null = null;
  ownerDetails: any = null;
  contactForm = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };
  emailError: string = '';
  phoneError: string = '';

  constructor(
    private favoritesService: FavoritesService,
    private propertyInquiryService: PropertyInquiryService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.favoritesService.favorites$.subscribe(() => {
      this.loadFavorites();
    });
  }

  loadFavorites(): void {
    this.favorites = this.favoritesService.getFavorites();
  }

  removeFromFavorites(productId: number): void {
    this.favoritesService.removeFromFavorites(productId);
  }

  getImageUrl(imageUrl: string): string {
    const serverUrl = 'https://localhost:44305';
    return imageUrl.startsWith('http') ? imageUrl : serverUrl + imageUrl;
  }

  editRating(product: ProductModel) {
    this.editingProduct = product;
    this.selectedRating = product.rating || 0;
    this.hoverRating = 0;
    this.showEditRatingDialog = true;
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  saveRating() {
    if (this.editingProduct && this.selectedRating > 0) {
      this.favoritesService.updateRating(this.editingProduct.productId, this.selectedRating);
      this.showEditRatingDialog = false;
      this.editingProduct = null;
      this.loadFavorites();
    }
  }
  
  openContactDialog(product: ProductModel) {
    this.contactProduct = product;
    this.ownerDetails = null;
    this.contactForm = { name: '', phone: '', email: '', message: '' };
    
    if (product.ownerId) {
      this.userService.getUserById(product.ownerId).subscribe({
        next: (owner) => {
          this.ownerDetails = owner;
        },
        error: (err) => console.error('Error loading owner details:', err)
      });
    }
    
    this.showContactDialog = true;
  }
  
  submitContact() {
    if (!this.contactProduct) return;
    
    if (!ValidationUtils.isValidEmail(this.contactForm.email)) {
      this.emailError = 'כתובת אימייל לא תקינה';
      return;
    }
    
    if (!ValidationUtils.isValidPhone(this.contactForm.phone)) {
      this.phoneError = 'מספר טלפון לא תקין (פורמט: 0XX-XXXXXXX)';
      return;
    }
    
    const currentUser = this.userService.getCurrentUser();
    const inquiry = {
      productId: this.contactProduct.productId,
      userId: currentUser?.userId || 0,
      ownerId: this.contactProduct.ownerId || 0,
      name: this.contactForm.name,
      phone: this.contactForm.phone,
      email: this.contactForm.email,
      message: this.contactForm.message
    };
    
    this.propertyInquiryService.createInquiry(inquiry).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הפנייה נשלחה בהצלחה' });
        this.showContactDialog = false;
        this.contactForm = { name: '', phone: '', email: '', message: '' };
        this.emailError = '';
        this.phoneError = '';
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בשליחת הפנייה' });
      }
    });
  }
}
