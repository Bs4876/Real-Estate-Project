import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { UserLoginDTOModel, UserRegisterDTOModel } from '../../models/user/user-model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, PasswordModule, ToastModule],
  providers: [MessageService],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class AuthComponent {
  isLoginMode = true;
  passwordStrength: number = 0;
  passwordStrengthText: string = '';
  passwordStrengthColor: string = '';

  loginData: UserLoginDTOModel = new UserLoginDTOModel();
  registerData: UserRegisterDTOModel = new UserRegisterDTOModel();

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.passwordStrength = 0;
    this.passwordStrengthText = '';
  }

  onPasswordChange() {
    const password = this.registerData.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    this.passwordStrength = strength;
    
    if (strength <= 1) {
      this.passwordStrengthText = 'חלשה';
      this.passwordStrengthColor = '#ef4444';
    } else if (strength <= 3) {
      this.passwordStrengthText = 'בינונית';
      this.passwordStrengthColor = '#f59e0b';
    } else {
      this.passwordStrengthText = 'חזקה';
      this.passwordStrengthColor = '#10b981';
    }
  }

  onSubmit() {
    if (this.isLoginMode) {
      const loginPayload = {
        ...this.loginData,
        email: this.loginData.email.toLowerCase()
      };
      this.userService.login(loginPayload).subscribe({
        next: (user) => {
          this.userService.saveUserToStorage(user);
          this.messageService.add({ severity: 'success', summary: 'התחברות', detail: `שלום ${user.fullName}!` });
          setTimeout(() => {
            const returnUrl = localStorage.getItem('returnUrl') || '/';
            localStorage.removeItem('returnUrl');
            this.router.navigate([returnUrl]).then(() => {
              window.location.reload();
            });
          }, 1000);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'אימייל או סיסמה שגויים' });
        }
      });
    } else {
      const registerPayload = {
        ...this.registerData,
        email: this.registerData.email.toLowerCase()
      };
      this.userService.register(registerPayload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'נרשמת בהצלחה! עבור להתחברות' });
          setTimeout(() => {
            this.isLoginMode = true;
            this.registerData = new UserRegisterDTOModel();
          }, 1500);
        },
        error: (err) => {
          const errorMessage = err.error?.message || err.error || "קרתה שגיאה לא צפויה";
          this.messageService.add({ 
            severity: 'error', 
            summary: 'שגיאת רישום', 
            detail: errorMessage 
          });
        }
      });
    }
  }
}
