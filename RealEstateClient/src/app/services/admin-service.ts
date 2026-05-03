import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStatisticsModel } from '../models/admin/admin-model';
import { UserProfileDTOModel } from '../models/user/user-model';
import { ProductModel } from '../models/product/product-model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:44305/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'IsAdmin': 'true' });
  }

  getStatistics(): Observable<AdminStatisticsModel> {
    return this.http.get<AdminStatisticsModel>(`${this.apiUrl}/statistics`, { headers: this.getHeaders() });
  }

  getAllUsers(): Observable<UserProfileDTOModel[]> {
    return this.http.get<UserProfileDTOModel[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  getAllProducts(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(`${this.apiUrl}/products`, { headers: this.getHeaders() });
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/${id}`, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/${id}`, { headers: this.getHeaders() });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/order/${id}`, { headers: this.getHeaders() });
  }
}
