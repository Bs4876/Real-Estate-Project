import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user-service';
import { OrderService } from '../../services/order-service';
import { ProductService } from '../../services/product-service';
import { PropertyInquiryService } from '../../services/property-inquiry-service';
import { UserUpdateDTOModel } from '../../models/user/user-model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, DialogModule, TimelineModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user-profile-component.html',
  styleUrl: './user-profile-component.scss'
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  currentUser: any = null;
  userForm: UserUpdateDTOModel = {};
  orders: any[] = [];
  myProducts: any[] = [];
  activeTab: number = 0;
  isLoadingProducts: boolean = false;
  showDeleteDialog: boolean = false;
  productToDelete: number | null = null;
  selectedOrder: any = null;
  showOrderDialog: boolean = false;
  myInquiries: any[] = [];
  inquiriesToMe: any[] = [];
  selectedInquiry: any = null;
  showInquiryDialog: boolean = false;
  showLogoutDialog: boolean = false;
  showPasswordDialog: boolean = false;
  passwordChangeForm = { oldPassword: '', newPassword: '' };

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private productService: ProductService,
    private propertyInquiryService: PropertyInquiryService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }
    
    // טען את הטאב מה-URL לפני הכל
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam) {
      this.activeTab = +tabParam;
      }
    
    this.loadUserData();
    this.loadOrders();
    
    if (this.activeTab === 2) {
      this.loadMyProducts();
    } else if (this.activeTab === 5) {
      this.loadMyInquiries();
    } else if (this.activeTab === 6) {
      this.loadInquiriesToMe();
    }
  }

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    const elements = this.elementRef.nativeElement.querySelectorAll('.field, .product-card-edit, .order-card, p-card, .tab-button');
    elements.forEach((element: Element) => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
  }

  loadUserData() {
    this.userForm = {
      fullName: this.currentUser.fullName,
      phone: this.currentUser.phone,
      address: this.currentUser.address
    };
  }

  loadOrders() {
    this.orderService.getOrdersByUserId(this.currentUser.userId).subscribe({
      next: (data) => {
        this.orders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.orders = [];
      }
    });
  }

  loadMyProducts() {
    this.isLoadingProducts = true;
    this.productService.getProductsByOwnerId(this.currentUser.userId).subscribe({
      next: (data) => {
        this.myProducts = data.map(product => ({
          ...product,
          imageUrl: this.getFullImageUrl(product.imageUrl)
        }));
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingProducts = false;
        this.myProducts = [];
        this.cdr.detectChanges();
      }
    });
  }

  getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl + '?t=' + Date.now();
    return 'https://localhost:44305' + imageUrl + '?t=' + Date.now();
  }

  updateProfile() {
    if (this.userForm.phone) {
      const phoneRegex = /^0[2-9]\d{7,8}$/;
      if (!phoneRegex.test(this.userForm.phone)) {
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: 'מספר טלפון לא תקין. הזן מספר ישראלי תקין (לדוגמה: 0501234567)',
          life: 4000
        });
        return;
      }
    }
    
    const updateData: UserUpdateDTOModel = {
      fullName: this.userForm.fullName,
      phone: this.userForm.phone,
      address: this.userForm.address
    };
    
    if (this.userForm.email && this.userForm.email.trim().length > 0) {
      updateData.email = this.userForm.email.toLowerCase();
    }
    
    this.userService.updateUser(this.currentUser.userId, updateData).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'הצלחה',
          detail: 'הפרטים עודכנו בהצלחה',
          life: 3000
        });
        this.currentUser.fullName = this.userForm.fullName;
        this.currentUser.phone = this.userForm.phone;
        this.currentUser.address = this.userForm.address;
        if (updateData.email) {
          this.currentUser.email = updateData.email;
        }
        this.userService.saveUserToStorage(this.currentUser);
        setTimeout(() => window.location.reload(), 1500);
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.error || 'שגיאה בעדכון הפרטים';
        this.messageService.add({
          severity: 'error',
          summary: 'שגיאה',
          detail: errorMsg,
          life: 4000
        });
      }
    });
  }

  openPasswordDialog() {
    this.passwordChangeForm = { oldPassword: '', newPassword: '' };
    this.showPasswordDialog = true;
  }

  changePassword() {
    if (!this.passwordChangeForm.oldPassword || !this.passwordChangeForm.newPassword) {
      this.messageService.add({ severity: 'warn', summary: 'שדות חסרים', detail: 'נא למלא את כל השדות', life: 3000 });
      return;
    }
    
    if (this.passwordChangeForm.newPassword.length < 8) {
      this.messageService.add({ severity: 'warn', summary: 'סיסמה קצרה', detail: 'הסיסמה החדשה חייבת להכיל לפחות 8 תווים', life: 3000 });
      return;
    }
    
    const updateData: UserUpdateDTOModel = {
      password: this.passwordChangeForm.newPassword,
      oldPassword: this.passwordChangeForm.oldPassword
    };
    
    this.userService.updateUser(this.currentUser.userId, updateData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הסיסמה שונתה בהצלחה', life: 3000 });
        this.showPasswordDialog = false;
        this.passwordChangeForm = { oldPassword: '', newPassword: '' };
      },
      error: (err) => {
        let errorMsg = 'שגיאה בשינוי הסיסמה';
        
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMsg = err.error;
        }
        
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: errorMsg, life: 4000 });
      }
    });
  }

  cancelPasswordChange() {
    this.showPasswordDialog = false;
    this.passwordChangeForm = { oldPassword: '', newPassword: '' };
  }

  editProduct(productId: number) {
    this.router.navigate(['/edit-product', productId]);
  }

  viewProduct(productId: number) {
    this.router.navigate(['/product-details', productId], { 
      queryParams: { returnTo: 'profile', tab: 2 } 
    });
  }

  deleteProduct(productId: number) {
    this.productToDelete = productId;
    this.showDeleteDialog = true;
  }

  confirmDelete() {
    if (this.productToDelete) {
      const updateData = { isAvailable: false };
      this.productService.updateProduct(this.productToDelete, updateData).subscribe({
        next: () => {
          this.showDeleteDialog = false;
          this.productToDelete = null;
          this.loadMyProducts();
        },
        error: (err) => {
          this.showDeleteDialog = false;
          this.productToDelete = null;
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog = false;
    this.productToDelete = null;
  }

  addNewProduct() {
    this.router.navigate(['/add-product']);
  }

  logout() {
    this.activeTab = 4;
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  confirmLogout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }
  
  cancelLogout() {
    this.showLogoutDialog = false;
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }

  setActiveTab(index: number) {
    this.activeTab = index;
    if (index === 2) {
      this.loadMyProducts();
    } else if (index === 5) {
      this.loadMyInquiries();
    } else if (index === 6) {
      this.loadInquiriesToMe();
    } else if (index === 7) {
      this.goToAdmin();
    }
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch(status?.toLowerCase()) {
      case 'pending': return 'warn';
      case 'confirmed': return 'info';
      case 'processing': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch(status?.toLowerCase()) {
      case 'pending': return 'התקבל';
      case 'confirmed': return 'אושר';
      case 'processing': return 'בטיפול';
      case 'delivered': return 'הסתיים';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  }

  viewOrderDetails(order: any) {
    this.selectedOrder = order;
    this.showOrderDialog = true;
  }

  closeOrderDialog() {
    this.showOrderDialog = false;
    this.selectedOrder = null;
  }

  isStepCompleted(currentStatus: string, stepStatus: string): boolean {
    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    return currentIndex > stepIndex;
  }

  loadMyInquiries() {
    this.propertyInquiryService.getInquiriesByUserId(this.currentUser.userId).subscribe({
      next: (data) => {
        this.myInquiries = data;
        this.cdr.detectChanges();
      },
      error: (err) => { /* Error handled */ } });
  }

  loadInquiriesToMe() {
    this.propertyInquiryService.getInquiriesByOwnerId(this.currentUser.userId).subscribe({
      next: (data) => {
        this.inquiriesToMe = data;
        this.cdr.detectChanges();
      },
      error: (err) => { /* Error handled */ } });
  }

  viewInquiryDetails(inquiry: any) {
    this.selectedInquiry = inquiry;
    this.showInquiryDialog = true;
  }

  closeInquiryDialog() {
    this.showInquiryDialog = false;
    this.selectedInquiry = null;
  }

  getInquiryStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch(status?.toLowerCase()) {
      case 'new': return 'info';
      case 'inprogress': return 'warn';
      case 'resolved': return 'success';
      default: return 'secondary';
    }
  }

  getInquiryStatusLabel(status: string): string {
    switch(status?.toLowerCase()) {
      case 'new': return 'חדש';
      case 'inprogress': return 'בטיפול';
      case 'resolved': return 'טופל';
      default: return status;
    }
  }

  viewInquiryProduct(productId: number) {
    this.router.navigate(['/product-details', productId]);
  }

  updateInquiryStatus(inquiryId: number, newStatus: string) {
    this.propertyInquiryService.updateInquiryStatus(inquiryId, newStatus).subscribe({
      next: () => {
        this.loadInquiriesToMe();
        if (this.selectedInquiry && this.selectedInquiry.inquiryId === inquiryId) {
          this.selectedInquiry.status = newStatus;
        }
        this.cdr.detectChanges();
      },
      error: (err) => { /* Error handled */ } });
  }
}
