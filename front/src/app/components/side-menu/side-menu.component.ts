import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RouterModule} from '@angular/router';
import {DrawerModule} from 'primeng/drawer';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  active?: boolean;
  badge?: number;
  hasChildren?: boolean;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage,DrawerModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
})
export class SideMenuComponent implements OnInit {
  isMenuOpen = false;
  // User profile information
  userProfile = {
    name: 'Hiba Chabbouh',
    email: 'hibachabbouh@gmail.com',
    picture: undefined,
  };
  // Top menu items
  topMenuItems: MenuItem[] = [
    {
      icon: 'pi pi-home',
      label: 'Home',
      route: '/home',

      badge: 2,
      hasChildren: false,
    },
    {
      icon: 'pi pi-th-large',
      label: 'Dashboard',
      route: '/dashboard',
      badge: 2,
      hasChildren: false,
    },
    {
      icon: 'pi pi-book',
      label: 'Books',
      route: '/books',
      hasChildren: false,
    },
    {
      icon: 'pi pi-clock',
      label: 'History',
      route: '/history',
      hasChildren: false,
    },
  ];
  // Bottom menu items
  bottomMenuItems: MenuItem[] = [
    {
      icon: 'pi pi-comments',
      label: 'Chats',
      route: '/chats',
      badge: 2,
    },
    {
      icon: 'pi pi-bell',
      label: 'Notifications',
      route: '/notifications',
      badge: 2,
    },
    {
      icon: 'pi pi-sign-out',
      label: 'Sign Out',
      route: '/logout',
    },
  ];

  constructor() {
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnInit(): void {
  }
}
