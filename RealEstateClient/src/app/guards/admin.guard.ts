import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user-service';

export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  const currentUser = userService.getCurrentUser();
  
  if (currentUser && currentUser.isAdmin) {
    return true;
  }
  
  router.navigate(['/']);
  return false;
};
