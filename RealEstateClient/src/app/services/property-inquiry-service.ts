import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertyInquiryCreateModel, PropertyInquiryModel } from '../models/property-inquiry/property-inquiry-model';

@Injectable({
  providedIn: 'root'
})
export class PropertyInquiryService {
  private apiUrl = 'https://localhost:44305/api/propertyinquiry';

  constructor(private http: HttpClient) {}

  createInquiry(inquiry: PropertyInquiryCreateModel): Observable<PropertyInquiryModel> {
    return this.http.post<PropertyInquiryModel>(this.apiUrl, inquiry);
  }

  getInquiryById(id: number): Observable<PropertyInquiryModel> {
    return this.http.get<PropertyInquiryModel>(`${this.apiUrl}/${id}`);
  }

  getInquiriesByOwnerId(ownerId: number): Observable<PropertyInquiryModel[]> {
    return this.http.get<PropertyInquiryModel[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  getInquiriesByUserId(userId: number): Observable<PropertyInquiryModel[]> {
    return this.http.get<PropertyInquiryModel[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAllInquiries(): Observable<PropertyInquiryModel[]> {
    return this.http.get<PropertyInquiryModel[]>(this.apiUrl);
  }

  updateInquiryStatus(id: number, status: string): Observable<PropertyInquiryModel> {
    return this.http.put<PropertyInquiryModel>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteInquiry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
