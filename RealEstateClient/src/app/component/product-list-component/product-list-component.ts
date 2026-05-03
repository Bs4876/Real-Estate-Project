import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product-service'; 
import { ProductSummaryDTOModel } from '../../models/product/product-model'; 
import { CommonModule } from '@angular/common';
import { ProductFilterComponent } from '../product-filter-component/product-filter-component';
import { ProductCardComponent } from '../product-card-component/product-card-component';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    PaginatorModule, 
    ProductFilterComponent, 
    ProductCardComponent,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './product-list-component.html',
  styleUrl: './product-list-component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class ProductListComponent implements OnInit, OnDestroy {
  products: ProductSummaryDTOModel[] = [];
  totalRecords: number = 0;
  rows: number = 9;
  currentPage: number = 1;
  currentFilters: any = {};
  loading: boolean = false;
  viewMode: 'grid' | 'list' = 'grid';
  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const sub = this.route.queryParams.subscribe(params => {
      this.currentFilters = {};
      
      if (params['categoryIds']) {
        const categoryId = +params['categoryIds'];
        this.currentFilters.categoryIds = [categoryId];
      }
      
      this.currentPage = 1;
      this.loadProducts();
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  handleFilter(filters: any) {
    this.currentFilters = filters;
    this.currentPage = 1;
    this.loadProducts();
  }

  loadProducts(event?: any) {
    if (event) {
      this.currentPage = (event.first / event.rows) + 1;
      this.rows = event.rows;
    }

    this.productService.getProducts(
      this.currentFilters.categoryIds || [],
      this.currentFilters.city || '',
      this.currentFilters.minPrice || null,
      this.currentFilters.maxPrice || null,
      this.currentFilters.rooms || null,
      this.currentFilters.beds || null,
      this.currentPage,
      this.rows
    ).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.products = response.data;
          this.totalRecords = response.totalItems;
        } else {
          this.products = [];
          this.totalRecords = 0;
        }
      },
      error: (err) => {
        console.error('שגיאה בשליפת מוצרים:', err);
        this.products = [];
        this.totalRecords = 0;
      }
    });
  }
}
