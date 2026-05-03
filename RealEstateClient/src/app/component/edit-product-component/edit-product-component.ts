import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../services/product-service';
import { CategoryService } from '../../services/category-service';
import { ProductUpdateDTOModel } from '../../models/product/product-model';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, InputNumberModule, ButtonModule, SelectModule],
  templateUrl: './edit-product-component.html',
  styleUrl: './edit-product-component.scss'
})
export class EditProductComponent implements OnInit {
  productId: number = 0;
  product: ProductUpdateDTOModel = {};
  currentMainImage: string = '';
  currentAdditionalImages: Array<{imageId: number, url: string}> = [];
  imagesToDelete: number[] = [];
  categories: any[] = [];
  transactionTypes = [
    { label: 'מכירה', value: 'Sale' },
    { label: 'השכרה', value: 'Rent' },
    { label: 'נופש', value: 'Vacation' }
  ];
  showImageSection: boolean = false;
  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  additionalImagesFiles: File[] = [];
  additionalImagesPreviews: string[] = [];
  returnTo: string = 'profile';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    this.route.queryParams.subscribe(params => {
      this.returnTo = params['returnTo'] || 'profile';
    });
    this.loadProduct();
    this.loadCategories();
  }

  loadProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (data) => {
        this.product = {
          title: data.title,
          description: data.description,
          price: data.price,
          city: data.city,
          rooms: data.rooms,
          beds: data.beds,
          categoryId: data.categoryId,
          TransactionType: data.TransactionType
        };
        this.currentMainImage = data.imageUrl;
        this.currentAdditionalImages = data.productImages?.map((img: any) => ({
          imageId: img.imageId,
          url: img.additionalImageUrl
        })) || [];
      },
      error: (err) => { /* Error handled */ } });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => { /* Error handled */ } });
  }

  onSubmit() {
    // תמיד נעדכן את הנתונים הבסיסיים תחילה
    if (this.mainImageFile) {
      this.uploadMainImage();
    } else {
      this.updateBasicData();
    }
  }

  updateBasicData() {
    const updateData: any = {
      title: this.product.title,
      description: this.product.description,
      price: this.product.price,
      city: this.product.city,
      categoryId: this.product.categoryId,
      TransactionType: this.product.TransactionType
    };
    if (this.product.rooms !== undefined) updateData.rooms = this.product.rooms;
    if (this.product.beds !== undefined) updateData.beds = this.product.beds;
    if (this.product.imageUrl) updateData.imageUrl = this.product.imageUrl;

    this.productService.updateProduct(this.productId, updateData).subscribe({
      next: () => {
        this.deleteMarkedImages();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: 'שגיאה בעדכון המוצר'
        });
      }
    });
  }

  deleteMarkedImages() {
    if (this.imagesToDelete.length === 0) {
      if (this.additionalImagesFiles.length > 0) {
        this.uploadAdditionalImages();
      } else {
        this.messageService.add({
          severity: 'success',
          summary: 'הצלחה',
          detail: 'המוצר עודכן בהצלחה!'
        });
        setTimeout(() => this.navigateBack(), 1500);
      }
      return;
    }

    const deletePromises = this.imagesToDelete.map(id => 
      this.productService.deleteProductImage(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      if (this.additionalImagesFiles.length > 0) {
        this.uploadAdditionalImages();
      } else {
        this.messageService.add({
          severity: 'success',
          summary: 'הצלחה',
          detail: 'המוצר עודכן בהצלחה!'
        });
        setTimeout(() => this.navigateBack(), 1500);
      }
    }).catch(err => {
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'שגיאה במחיקת תמונות'
      });
    });
  }

  uploadMainImage() {
    const formData = new FormData();
    formData.append('file', this.mainImageFile!);
    this.productService.uploadImage(formData).subscribe({
      next: (imageUrl) => {
        this.product.imageUrl = imageUrl;
        this.updateBasicData();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: 'שגיאה בהעלאת התמונה'
        });
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
      // הוספת תמונות חדשות דרך ProductImage API
      const addImagePromises = urls.map(url => {
        const imageData = { productId: this.productId, additionalImageUrl: url || '' };
        return this.productService.addProductImage(imageData).toPromise();
      });
      return Promise.all(addImagePromises);
    }).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'הצלחה',
        detail: 'המוצר עודכן בהצלחה!'
      });
      setTimeout(() => this.navigateBack(), 1500);
    }).catch(err => {
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'שגיאה בהעלאת תמונות נוספות'
      });
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

  removeExistingImage(index: number) {
    const imageToDelete = this.currentAdditionalImages[index];
    this.imagesToDelete.push(imageToDelete.imageId);
    this.currentAdditionalImages.splice(index, 1);
  }

  toggleImageSection() {
    this.showImageSection = !this.showImageSection;
  }

  cancel() {
    this.navigateBack();
  }

  navigateBack() {
    if (this.returnTo === 'details') {
      this.router.navigate(['/product-details', this.productId]);
    } else if (this.returnTo === 'products') {
      this.router.navigate(['/products']);
    } else {
      this.router.navigate(['/profile'], { queryParams: { tab: 2 } });
    }
  }

  getFullImageUrl(imageUrl: string | {imageId: number, url: string}): string {
    const url = typeof imageUrl === 'string' ? imageUrl : imageUrl.url;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'https://localhost:44305' + url;
  }
}
