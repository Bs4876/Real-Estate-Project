import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '../../services/admin-service';
import { AdminStatisticsModel } from '../../models/admin/admin-model';
import { UserProfileDTOModel } from '../../models/user/user-model';
import { ProductModel } from '../../models/product/product-model';
import { UserService } from '../../services/user-service';
import { OrderService } from '../../services/order-service';
import { ContactService } from '../../services/contact-service';
import { PropertyInquiryService } from '../../services/property-inquiry-service';
import { AdminInquiryService } from '../../services/admin-inquiry-service';
import { CategoryService } from '../../services/category-service';
import { CategoryDTOModel, CategoryCreateDTOModel, CategoryUpdateDTOModel } from '../../models/category/category-model';
import { ProductDetailsComponent } from '../product-details-component/product-details-component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule, DialogModule, SelectModule, ChartModule, InputTextModule, TextareaModule, ProductDetailsComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.scss'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  activeTab: number = 0;
  statistics: AdminStatisticsModel = new AdminStatisticsModel();
  users: UserProfileDTOModel[] = [];
  products: ProductModel[] = [];
  orders: any[] = [];
  loading = true;
  
  ordersChartData: any;
  revenueChartData: any;
  usersChartData: any;
  chartOptions: any;

  displayUserDialog = false;
  displayProductDialog = false;
  displayOrderDialog = false;
  selectedUser: any = null;
  selectedProductId: number | null = null;
  selectedOrder: any = null;
  
  contactMessages: any[] = [];
  displayMessageDialog = false;
  selectedMessage: any = null;
  
  propertyInquiries: any[] = [];
  displayInquiryDialog = false;
  selectedInquiry: any = null;
  
  adminInquiries: any[] = [];
  displayAdminInquiryDialog = false;
  selectedAdminInquiry: any = null;
  
  categories: CategoryDTOModel[] = [];
  displayCategoryDialog = false;
  selectedCategory: CategoryDTOModel | null = null;
  categoryForm = {
    categoryName: '',
    description: ''
  };
  
  inquiryStatusOptions = [
    { label: 'חדש', value: 'New' },
    { label: 'בטיפול', value: 'InProgress' },
    { label: 'טופל', value: 'Resolved' }
  ];
  
  messageStatusOptions = [
    { label: 'חדש', value: 'New' },
    { label: 'בטיפול', value: 'InProgress' },
    { label: 'טופל', value: 'Resolved' }
  ];
  
  statusOptions = [
    { label: 'התקבל', value: 'Pending' },
    { label: 'אושר', value: 'Confirmed' },
    { label: 'בטיפול', value: 'Processing' },
    { label: 'הסתיים', value: 'Delivered' },
    { label: 'בוטל', value: 'Cancelled' }
  ];

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private orderService: OrderService,
    private contactService: ContactService,
    private propertyInquiryService: PropertyInquiryService,
    private adminInquiryService: AdminInquiryService,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = +params['tab'];
        this.cdr.detectChanges();
      }
    });
    this.loadData();
    this.initCharts();
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

    const elements = this.elementRef.nativeElement.querySelectorAll('.stat-card, .chart-card, .table-card, .tab-button');
    elements.forEach((element: Element) => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
  }
  
  initCharts(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            font: { size: 14 }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
    
    this.ordersChartData = {
      labels: ['התקבל', 'אושר', 'בטיפול', 'הסתיים', 'בוטל'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#26A69A', '#EF5350']
      }]
    };
    
    this.revenueChartData = {
      labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
      datasets: [{
        label: 'הכנסות',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
    
    this.usersChartData = {
      labels: ['משתמשים', 'מנהלים'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#66BB6A', '#FFA726']
      }]
    };
  }

  loadData(): void {
    this.loading = true;
    this.adminService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading statistics:', err)
    });

    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.updateCharts();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading users:', err)
    });

    this.adminService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.adminService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.updateCharts();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading orders:', err)
    });
    
    this.contactService.getAllMessages().subscribe({
      next: (data) => {
        this.contactMessages = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.contactMessages = [];
        console.error('Error loading messages:', err);
      }
    });
    
    this.propertyInquiryService.getAllInquiries().subscribe({
      next: (data) => {
        this.propertyInquiries = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading inquiries:', err)
    });
    
    this.adminInquiryService.getAllInquiries().subscribe({
      next: (data) => {
        this.adminInquiries = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading admin inquiries:', err)
    });
    
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }
  
  updateCharts(): void {
    if (this.orders && this.orders.length > 0) {
      const ordersByStatus = this.orders.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      
      this.ordersChartData = {
        labels: ['התקבל', 'אושר', 'בטיפול', 'הסתיים', 'בוטל'],
        datasets: [{
          data: [
            ordersByStatus['Pending'] || 0,
            ordersByStatus['Confirmed'] || 0,
            ordersByStatus['Processing'] || 0,
            ordersByStatus['Delivered'] || 0,
            ordersByStatus['Cancelled'] || 0
          ],
          backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#26A69A', '#EF5350']
        }]
      };
    }
    
    if (this.users && this.users.length > 0) {
      const adminCount = this.users.filter(u => u.isAdmin).length;
      const userCount = this.users.length - adminCount;
      this.usersChartData = {
        labels: ['משתמשים', 'מנהלים'],
        datasets: [{
          data: [userCount, adminCount],
          backgroundColor: ['#66BB6A', '#FFA726']
        }]
      };
    }
  }

  
  setActiveTab(index: number): void {
    this.activeTab = index;
    this.cdr.detectChanges();
  }

  deleteUser(userId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק משתמש זה?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'המשתמש נמחק בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת המשתמש' });
            console.error('Error deleting user:', err);
          }
        });
      }
    });
  }

  deleteProduct(productId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק מוצר זה?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.adminService.deleteProduct(productId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'המוצר נמחק בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת המוצר' });
            console.error('Error deleting product:', err);
          }
        });
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  deleteOrder(orderId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק הזמנה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.orderService.deleteOrder(orderId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'ההזמנה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת ההזמנה' });
            console.error('Error deleting order:', err);
          }
        });
      }
    });
  }
  
  updateOrderStatus(order: any, newStatus: string): void {
    this.orderService.updateOrderStatus(order.orderId, { status: newStatus }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס ההזמנה עודכן' });
        this.loadData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating order status:', err);
      }
    });
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
  
  calculateCommission(order: any): number {
    if (!order.orderItems || order.orderItems.length === 0) return 0;
    
    let commission = 0;
    order.orderItems.forEach((item: any) => {
      const transactionType = item.product?.transactionType;
      const price = item.priceAtPurchase || 0;
      
      if (transactionType === 'Vacation') {
        commission += price * 0.03;
      } else if (transactionType === 'Rent') {
        const months = this.calculateMonths(item.startDate, item.endDate);
        if (months > 0) {
          commission += price / (months + 1);
        }
      }
    });
    return commission;
  }
  
  calculateMonths(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }
  
  getTotalInquiries(): number {
    return this.propertyInquiries.length + this.adminInquiries.length;
  }

  getTotalCommissions(): number {
    return this.orders.reduce((total, order) => total + this.calculateCommission(order), 0);
  }

  viewUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        this.selectedUser = data;
        setTimeout(() => {
          this.displayUserDialog = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בטעינת פרטי המשתמש' });
        console.error('Error loading user details:', err);
      }
    });
  }

  viewProductDetails(productId: number): void {
    if (!productId || productId <= 0) {
      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'מזהה מוצר לא תקין' });
      return;
    }
    setTimeout(() => {
      this.selectedProductId = productId;
      this.displayProductDialog = true;
      this.cdr.detectChanges();
    });
  }

  viewOrderDetails(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.selectedOrder = data;
        setTimeout(() => {
          this.displayOrderDialog = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בטעינת פרטי ההזמנה' });
        console.error('Error loading order details:', err);
      }
    });
  }
  
  viewMessageDetails(message: any): void {
    this.selectedMessage = message;
    this.displayMessageDialog = true;
  }
  
  updateMessageStatus(message: any, newStatus: string): void {
    this.contactService.updateMessageStatus(message.id, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס הפנייה עודכן' });
        this.loadData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating message status:', err);
      }
    });
  }
  
  deleteMessage(messageId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק פנייה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.contactService.deleteMessage(messageId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הפנייה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת הפנייה' });
            console.error('Error deleting message:', err);
          }
        });
      }
    });
  }
  
  getMessageStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch(status?.toLowerCase()) {
      case 'new': return 'info';
      case 'inprogress': return 'warn';
      case 'resolved': return 'success';
      default: return 'secondary';
    }
  }
  
  viewInquiryDetails(inquiry: any): void {
    this.selectedInquiry = inquiry;
    this.displayInquiryDialog = true;
  }
  
  updateInquiryStatus(inquiry: any, newStatus: string): void {
    this.propertyInquiryService.updateInquiryStatus(inquiry.inquiryId, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס הפנייה עודכן' });
        inquiry.status = newStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating inquiry status:', err);
      }
    });
  }
  
  deleteInquiry(inquiryId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק פנייה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.propertyInquiryService.deleteInquiry(inquiryId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הפנייה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת הפנייה' });
            console.error('Error deleting inquiry:', err);
          }
        });
      }
    });
  }
  
  viewAdminInquiryDetails(inquiry: any): void {
    this.selectedAdminInquiry = inquiry;
    this.displayAdminInquiryDialog = true;
  }
  
  updateAdminInquiryStatus(inquiry: any, newStatus: string): void {
    this.adminInquiryService.updateInquiryStatus(inquiry.inquiryId, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס הפנייה עודכן' });
        inquiry.status = newStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating admin inquiry status:', err);
      }
    });
  }
  
  deleteAdminInquiry(inquiryId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק פנייה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.adminInquiryService.deleteInquiry(inquiryId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הפנייה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת הפנייה' });
            console.error('Error deleting admin inquiry:', err);
          }
        });
      }
    });
  }
  
  openCategoryDialog(category?: CategoryDTOModel): void {
    if (category) {
      this.selectedCategory = category;
      this.categoryForm = {
        categoryName: category.categoryName,
        description: category.description || ''
      };
    } else {
      this.selectedCategory = null;
      this.categoryForm = {
        categoryName: '',
        description: ''
      };
    }
    this.displayCategoryDialog = true;
  }
  
  saveCategory(): void {
    if (!this.categoryForm.categoryName.trim()) {
      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'נא להזין שם קטגוריה' });
      return;
    }
    
    if (this.selectedCategory) {
      const updateDto: CategoryUpdateDTOModel = {
        categoryName: this.categoryForm.categoryName,
        description: this.categoryForm.description
      };
      this.categoryService.updateCategory(this.selectedCategory.categoryId, updateDto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הקטגוריה עודכנה בהצלחה' });
          this.displayCategoryDialog = false;
          this.loadData();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הקטגוריה' });
          console.error('Error updating category:', err);
        }
      });
    } else {
      const createDto: CategoryCreateDTOModel = {
        categoryName: this.categoryForm.categoryName,
        description: this.categoryForm.description
      };
      this.categoryService.createCategory(createDto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הקטגוריה נוספה בהצלחה' });
          this.displayCategoryDialog = false;
          this.loadData();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בהוספת הקטגוריה' });
          console.error('Error creating category:', err);
        }
      });
    }
  }
  
  deleteCategory(categoryId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק קטגוריה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.categoryService.deleteCategory(categoryId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הקטגוריה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת הקטגוריה' });
            console.error('Error deleting category:', err);
          }
        });
      }
    });
  }
}
