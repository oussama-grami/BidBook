import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  isAuthenticated(): boolean {
    return true;
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }

    // Show a success notification
    this.notificationService.showSuccess(
      'You have been successfully logged out'
    );

    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
