import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminInquiryCreateModel, AdminInquiryModel } from '../models/admin-inquiry/admin-inquiry-model';

@Injectable({
  providedIn: 'root'
})
export class AdminInquiryService {
  private apiUrl = 'https://localhost:44305/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'IsAdmin': 'true' });
  }

  createInquiry(inquiry: AdminInquiryCreateModel): Observable<AdminInquiryModel> {
    return this.http.post<AdminInquiryModel>(`${this.apiUrl}/inquiry`, inquiry);
  }

  getAllInquiries(): Observable<AdminInquiryModel[]> {
    return this.http.get<AdminInquiryModel[]>(`${this.apiUrl}/inquiries`, { headers: this.getHeaders() });
  }

  getInquiryById(id: number): Observable<AdminInquiryModel> {
    return this.http.get<AdminInquiryModel>(`${this.apiUrl}/inquiry/${id}`, { headers: this.getHeaders() });
  }

  updateInquiryStatus(id: number, status: string): Observable<AdminInquiryModel> {
    return this.http.put<AdminInquiryModel>(`${this.apiUrl}/inquiry/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  deleteInquiry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inquiry/${id}`, { headers: this.getHeaders() });
  }
}
