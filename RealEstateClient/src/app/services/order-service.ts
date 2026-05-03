import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OccupiedDatesResponseDTOModel } from '../models/order/order-model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://localhost:44305/api/order';

  constructor(private http: HttpClient) {}

  getOccupiedDates(productId: number, month: number, year: number): Observable<OccupiedDatesResponseDTOModel> {
    return this.http.get<OccupiedDatesResponseDTOModel>(`${this.apiUrl}/occupied-dates/${productId}`, {
      params: { month: month.toString(), year: year.toString() }
    });
  }

  getOrdersByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }

  getOrderById(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}`);
  }
  
  updateOrderStatus(orderId: number, statusData: { status: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/status`, statusData);
  }
  
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`);
  }
}
