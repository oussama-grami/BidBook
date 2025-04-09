import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';

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
      icon: 'pi pi-home',
      label: 'Home',
      route: '/',
      hasChildren: false,
    },
    {
      icon: 'pi pi-book',
      label: 'Books',
      route: '/books',
      hasChildren: true,
      children: [
        {
          icon: 'pi pi-bookmark',
          label: 'Library',
          route: '/books',
        },
        {
          icon: 'pi pi-heart',
          label: 'Favorites',
          route: '/books/favorites',
        },
        {
          icon: 'pi pi-plus',
          label: 'Add Book',
          route: '/add-book',
        },
      ],
    },
    {
      icon: 'pi pi-file',
      label: 'Articles',
      route: '/articles',
      hasChildren: false,
    },
    {
      icon: 'pi pi-dollar',
      label: 'Payment',
      route: '/payment',
      hasChildren: false,
    },
    {
      icon: 'pi pi-book',
      label: 'Book Details',
      route: '/book-details',
      hasChildren: false,
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
      icon: 'pi pi-cog',
      label: 'Settings',
      route: '/settings',
      hasChildren: true,
      children: [
        {
          icon: 'pi pi-user',
          label: 'Profile',
          route: '/profile',
        },
        {
          icon: 'pi pi-palette',
          label: 'Theme',
          route: '/theme',
        },
      ],
    },
    {
      icon: 'pi pi-sign-out',
      label: 'Sign Out',
      route: '/logout',
    },
  ];

  constructor() {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnInit(): void {}
}
