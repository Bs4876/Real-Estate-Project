import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { CategoryService } from '../../services/category-service';
import { CategoryDTOModel } from '../../models/category/category-model';
import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';
import { FavoritesService } from '../../services/favorites-service';
import { ProductService } from '../../services/product-service';
import { debounceTime, Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MenubarModule, ButtonModule, BadgeModule, MenuModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  favoritesCount = 0;
  categories: CategoryDTOModel[] = [];
  currentUser: any = null;
  showUserMenu = false;
  showAdminMenu = false;
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 50;
  }

  navigateToAdminTab(tab: number) {
    this.showAdminMenu = false;
    this.router.navigate(['/admin'], { queryParams: { tab: tab } });
  }
  
  searchQuery = '';
  searchResults: any[] = [];
  showSearchResults = false;
  isSearching = false;
  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sub1 = this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
    this.subscriptions.push(sub1);
    
    this.currentUser = this.userService.getCurrentUser();
    
    const sub2 = this.cartService.getCart().subscribe(items => {
      this.cartItemCount = items.length;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(sub2);
    
    const sub3 = this.favoritesService.favorites$.subscribe(favorites => {
      this.favoritesCount = favorites.length;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(sub3);
    
    const sub4 = this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.performSearch(query);
    });
    this.subscriptions.push(sub4);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchResults = false;
    }
  }
  
  onSearchInput() {
    if (this.searchQuery.trim().length > 0) {
      this.showSearchResults = true;
      this.isSearching = true;
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchResults = [];
      this.showSearchResults = false;
    }
  }
  
  performSearch(query: string) {
    this.productService.searchProducts(query).subscribe({
      next: (results) => {
        this.searchResults = results.slice(0, 7);
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isSearching = false;
      }
    });
  }
  
  onSearchEnter() {
    if (this.searchQuery.trim()) {
      this.showSearchResults = false;
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
    }
  }
  
  navigateToProduct(productId: number) {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.router.navigate(['/product-details', productId]);
  }
  
  viewAllResults() {
    this.showSearchResults = false;
    this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
  }

  isAdmin(): boolean {
    const user = this.userService.getCurrentUser();
    return user?.isAdmin || false;
  }

  trackByCategory(index: number, category: CategoryDTOModel): number {
    return category.categoryId;
  }

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  addProduct() {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/add-product']);
    } else {
      localStorage.setItem('returnUrl', '/add-product');
      this.router.navigate(['/auth']);
    }
  }

  getProductImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'assets/placeholder.jpg';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const serverUrl = 'https://localhost:44305';
    return serverUrl + '/' + imageUrl;
  }
}
