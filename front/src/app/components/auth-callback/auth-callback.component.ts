import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProgressSpinnerModule,
    MessageModule,
  ],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css',
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;
  provider: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Extract query parameters and provider from route
    this.route.queryParams.subscribe((params) => {
      // Get the provider from the query param
      this.provider = params['provider'];
      const error = params['error'];
      if (error) {
        this.error = decodeURIComponent(error);
        this.loading = false;
        return;
      }

      if (!this.provider) {
        this.error = 'Authentication provider not specified';
        this.loading = false;
        return;
      }

      this.authService
        .getProfile()
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (user) => {
            // Store authentication data
            this.authService.setAuthData(user);
            this.notificationService.showSuccess(
              `Successfully logged in with ${this.provider}`
            );
            // Redirect to home page
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Authentication error:', err);
            this.error =
              err.error?.message || 'Failed to authenticate. Please try again.';
          },
        });
    });
  }

  tryAgain(): void {
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
