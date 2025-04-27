import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  active?: boolean;
  badge?: number;
  hasChildren?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage, DrawerModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
})
export class SideMenuComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  userProfile = {
    name: 'Hiba Chabbouh',
    email: 'hibachabbouh@gmail.com',
    picture: '',
  };
  private authStateSubscription: Subscription | null = null;
  private currentUserSubscription: Subscription | null = null;
  private timestamp = new Date().getTime(); // Used to bust cache
  private isLoadingProfile = false; // Flag to prevent infinite recursion

  topMenuItems: MenuItem[] = [
    {
      icon: 'pi pi-book',
      label: 'Books',
      hasChildren: true,
      children: [
        {
          icon: 'pi pi-list',
          label: 'All Books',
          route: '/books',
        },
        {
          icon: 'pi pi-money-bill',
          label: 'My Bids',
          route: '/books/favorite',
        },
        {
          icon: 'pi pi-plus',
          label: 'Add Book',
          route: '/books/add',
        },
      ],
    },
    {
      icon: 'pi pi-file',
      label: 'Articles',
      hasChildren: true,
      children: [
        {
          icon: 'pi pi-list',
          label: 'All Articles',
          route: '/articles',
        },
        {
          icon: 'pi pi-plus',
          label: 'Add Article',
          route: '/articles/add',
        },
      ],
    },
    {
      icon: 'pi pi-history',
      label: 'History',
      route: '/transactions',
      hasChildren: false,
    },
  ];

  authMenuItems: MenuItem[] = [
    {
      icon: 'pi pi-user',
      label: 'Login',
      route: '/login',
    },
    {
      icon: 'pi pi-user-plus',
      label: 'Sign Up',
      route: '/signup',
    },
    {
      icon: 'pi pi-lock',
      label: 'Forgot Password',
      route: '/forget-password',
    },
  ];

  bottomMenuItems: MenuItem[] = [
    {
      icon: 'pi pi-bell',
      label: 'Notifications',
      route: '/notifications',
    },
    {
      icon: 'pi pi-comments',
      label: 'Chat',
      route: '/chat',
    },
    {
      icon: 'pi pi-shield',
      label: 'Security Settings',
      route: '/mfa-setup',
    },
  ];

  constructor(
    public authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    // Remove loadUserProfile call from constructor
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Helper function to generate URL with cache-busting parameter
  getImageUrl(url: string): string {
    if (!url) return '/images/person.png';
    // Check if the URL is already absolute
    return url;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  loadUserProfile() {
    // Prevent recursive calls while a profile load is in progress
    if (this.isLoadingProfile) {
      return;
    }

    this.isLoadingProfile = true;

    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res) {
          this.userProfile.picture = res.imgUrl || '';
          console.log('User profile ', res);
          this.userProfile.name = `${res.firstName} ${res.lastName}`;
          this.userProfile.email = res.email;
          this.changeDetectorRef.markForCheck();
          // Update timestamp for cache busting
          this.timestamp = new Date().getTime();
        }
        this.isLoadingProfile = false;
      },
      error: (err) => {
        console.log('Error loading profile:', err);
        this.isLoadingProfile = false;
      },
    });
  }

  ngOnInit(): void {
    // Update user profile with email from auth service
    const userInfo = this.authService.getCurrentUserInfo();
    if (userInfo.email) {
      this.userProfile.email = userInfo.email;
    }

    // Subscribe to auth state changes
    this.authStateSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        // Only load profile if authenticated and we don't already have the user information
        if (isAuthenticated && !this.userProfile.name.includes(' ')) {
          this.loadUserProfile();
        }
      }
    );

    // Subscribe to current user changes
    this.currentUserSubscription = this.authService.currentUser$.subscribe(
      (user) => {
        if (user) {
          this.userProfile.picture = user.imgUrl || '';
          this.userProfile.name = `${user.firstName} ${user.lastName}`;
          this.userProfile.email = user.email;
          // Update timestamp for cache busting
          this.timestamp = new Date().getTime();
        }
      }
    );

    // Initial load of profile if authenticated
    if (this.isAuthenticated) {
      this.loadUserProfile();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }
}
