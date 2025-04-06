import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {
  // User profile information
  userProfile = {
    name: 'Hiba Chabbouh',
    email: 'hibachabbouh@gmail.com',
  };

  // Top menu items
  topMenuItems: MenuItem[] = [
    {
      icon: 'pi pi-home',
      label: 'Home',
      route: '/home',
      active: true,
      badge: 2,
      hasChildren: true
    },
    {
      icon: 'pi pi-th-large',
      label: 'Dashboard',
      route: '/dashboard',
      badge: 2,
      hasChildren: true
    },
    {
      icon: 'pi pi-book',
      label: 'Books',
      route: '/books',
      hasChildren: true
    },
    {
      icon: 'pi pi-clock',
      label: 'History',
      route: '/history',
      hasChildren: true
    }
  ];

  // Bottom menu items
  bottomMenuItems: MenuItem[] = [
    {
      icon: 'pi pi-comments',
      label: 'Chats',
      route: '/chats',
      badge: 2
    },
    {
      icon: 'pi pi-bell',
      label: 'Notifications',
      route: '/notifications',
      badge: 2
    },
    {
      icon: 'pi pi-sign-out',
      label: 'Sign Out',
      route: '/logout'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
