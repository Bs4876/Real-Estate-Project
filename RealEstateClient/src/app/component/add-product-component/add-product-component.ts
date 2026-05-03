import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../services/product-service';
import { CategoryService } from '../../services/category-service';
import { UserService } from '../../services/user-service';
import { ProductCreateDTOModel } from '../../models/product/product-model';
import { CategoryDTOModel } from '../../models/category/category-model';
import { ProductImageUrlDTOModel } from '../../models/product-image/product-image-model';
import { calculateSellerCommission, calculateSellerReceives, getCommissionText, calculateBuyerCommission } from '../../config/commission.config';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    InputTextModule, 
    InputNumberModule, 
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './add-product-component.html',
  styleUrl: './add-product-component.scss'
})
export class AddProductComponent implements OnInit {
  product: ProductCreateDTOModel = new ProductCreateDTOModel();
  categories: CategoryDTOModel[] = [];
  transactionTypes = [
    { label: 'מכירה', value: 'Sale' },
    { label: 'השכרה', value: 'Rent' },
    { label: 'נופש', value: 'Vacation' }
  ];

  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  additionalImagesFiles: File[] = [];
  additionalImagesPreviews: string[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.userService.isLoggedIn()) {
      this.messageService.add({ severity: 'warn', summary: 'התחברות נדרשת', detail: 'יש להתחבר כדי לפרסם מוצר' });
      setTimeout(() => {
        this.router.navigate(['/auth']);
      }, 2000);
      return;
    }

    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בטעינת קטגוריות' });
      }
    });
  }

  onMainImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.mainImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.mainImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onAdditionalImagesSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      this.additionalImagesFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.additionalImagesPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeAdditionalImage(index: number) {
    this.additionalImagesFiles.splice(index, 1);
    this.additionalImagesPreviews.splice(index, 1);
  }

  onSubmit() {
    if (!this.mainImageFile) {
      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'חובה להעלות תמונה ראשית' });
      return;
    }

    // קודם נעלה את התמונה הראשית
    const mainImageFormData = new FormData();
    mainImageFormData.append('file', this.mainImageFile);

    this.productService.uploadImage(mainImageFormData).subscribe({
      next: (mainImageUrl) => {
        this.product.imageUrl = mainImageUrl;
        
        // אם יש תמונות נוספות, נעלה אותן
        if (this.additionalImagesFiles.length > 0) {
          this.uploadAdditionalImages();
        } else {
          this.createProduct();
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בהעלאת התמונה הראשית' });
      }
    });
  }

  uploadAdditionalImages() {
    const uploadPromises = this.additionalImagesFiles.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return this.productService.uploadImage(formData).toPromise();
    });

    Promise.all(uploadPromises).then(urls => {
      this.product.productImages = urls.map(url => ({ additionalImageUrl: url || '' }));
      this.createProduct();
    }).catch(err => {
      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בהעלאת תמונות נוספות' });
    });
  }

  createProduct() {
    // בדיקה נוספת לפני שליחה
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'יש להתחבר כדי לפרסם מוצר' });
      this.router.navigate(['/auth']);
      return;
    }

    // ממיר categoryId לnumber
    this.product.categoryId = Number(this.product.categoryId);
    this.product.ownerId = currentUser.userId;
    
    this.productService.createProduct(this.product).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'המוצר פורסם בהצלחה!' });
        this.resetForm();
        setTimeout(() => {
          this.router.navigate(['/profile'], { queryParams: { tab: 2 } });
        }, 1500);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בפרסום המוצר' });
      }
    });
  }

  resetForm() {
    this.product = new ProductCreateDTOModel();
    this.mainImageFile = null;
    this.mainImagePreview = null;
    this.additionalImagesFiles = [];
    this.additionalImagesPreviews = [];
  }

  getSellerCommission(): number {
    return calculateSellerCommission(this.product.price || 0, this.product.TransactionType || 'Sale');
  }

  getSellerReceives(): number {
    return calculateSellerReceives(this.product.price || 0, this.product.TransactionType || 'Sale');
  }

  getCommissionInfo(): string {
    return getCommissionText(this.product.TransactionType || 'Sale');
  }

  getSellerRate(): string {
    const type = this.product.TransactionType?.toUpperCase();
    switch(type) {
      case 'SALE': return '1%';
      case 'RENT': return '0%';
      case 'VACATION': return '5%';
      default: return '5%';
    }
  }

  getBuyerRate(): string {
    const type = this.product.TransactionType?.toUpperCase();
    switch(type) {
      case 'SALE': return '1%';
      case 'RENT': return 'חודש שלם';
      case 'VACATION': return '3%';
      default: return '2%';
    }
  }

  getBuyerCommission(): number {
    return calculateBuyerCommission(this.product.price || 0, this.product.TransactionType || 'Sale');
  }
}
