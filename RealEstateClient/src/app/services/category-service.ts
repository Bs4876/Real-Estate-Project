import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDTOModel, CategoryCreateDTOModel, CategoryUpdateDTOModel } from '../models/category/category-model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://localhost:44305/api/category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryDTOModel[]> {
    return this.http.get<CategoryDTOModel[]>(this.apiUrl);
  }

  createCategory(category: CategoryCreateDTOModel): Observable<CategoryDTOModel> {
    return this.http.post<CategoryDTOModel>(this.apiUrl, category);
  }

  updateCategory(categoryId: number, category: CategoryUpdateDTOModel): Observable<CategoryDTOModel> {
    return this.http.put<CategoryDTOModel>(`${this.apiUrl}/${categoryId}`, category);
  }

  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${categoryId}`);
  }
}
