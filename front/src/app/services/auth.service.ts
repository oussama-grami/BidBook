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

  logout() {
    // Clear any stored auth tokens/user data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Show a success notification
    this.notificationService.showSuccess(
      'You have been successfully logged out'
    );

    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
