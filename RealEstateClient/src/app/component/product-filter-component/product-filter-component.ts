import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { CategoryService } from '../../services/category-service';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    InputTextModule, 
    InputNumberModule, 
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './product-filter-component.html',
  styleUrl: './product-filter-component.scss',
})

export class ProductFilterComponent implements OnInit {
  filterData = {
    city: '',
    minPrice: null,
    maxPrice: null,
    rooms: null,
    beds: null,
    categoryIds: []
  };

  categories: any[] = [];

  @Output() onFilter = new EventEmitter<any>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  search() {
    this.onFilter.emit(this.filterData);
  }

  clear() {
    this.filterData = { city: '', minPrice: null, maxPrice: null, rooms: null, beds: null, categoryIds: [] };
    this.search();
  }
}
