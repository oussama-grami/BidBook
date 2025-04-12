import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { AuthService } from '../../services/auth.service';

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
export class SideMenuComponent implements OnInit {
  isMenuOpen = false;
  userProfile = {
    name: 'Hiba Chabbouh',
    email: 'hibachabbouh@gmail.com',
    picture: undefined,
  };

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
      badge: 2,
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

  constructor(public authService: AuthService) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  ngOnInit(): void {
    // Update user profile with email from auth service
    const userInfo = this.authService.getCurrentUserInfo();
    if (userInfo.email) {
      this.userProfile.email = userInfo.email;
    }
  }
}
