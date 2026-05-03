import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLoginDTOModel, UserRegisterDTOModel, UserProfileDTOModel, UserUpdateDTOModel } from '../models/user/user-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://localhost:44305/api/users';

  constructor(private http: HttpClient) { }


  register(userData: UserRegisterDTOModel): Observable<any> {
    return this.http.post(`${this.apiUrl}`, userData);
  }

  login(credentials: UserLoginDTOModel): Observable<UserProfileDTOModel> {
    return this.http.post<UserProfileDTOModel>(`${this.apiUrl}/login`, credentials);
  }


  saveUserToStorage(user: UserProfileDTOModel): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }


  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.userId > 0;
  }

  getCurrentUser(): UserProfileDTOModel | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }


  logout(): void {
    localStorage.removeItem('currentUser');
  }

 
  updateUser(id: number, userData: UserUpdateDTOModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }


  getUserById(id: number): Observable<UserProfileDTOModel> {
    return this.http.get<UserProfileDTOModel>(`${this.apiUrl}/${id}`);
  }
}