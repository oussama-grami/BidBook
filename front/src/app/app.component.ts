import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationError,
  NavigationCancel,
} from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LoadingService } from './services/loading.service';
import { fadeAnimation, slideAnimation } from './shared/animations';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MenubarModule,
    ButtonModule,
    Toast,
    SideMenuComponent,
    LoadingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [fadeAnimation, slideAnimation],
})
export class AppComponent implements OnInit {
  title = 'E-Books';
  menuItems: MenuItem[] = [];
  isLoggedIn: boolean = true;
  isSmallScreen: boolean = false;

  constructor(
    private router: Router,
    public loadingService: LoadingService,
    private authService: AuthService
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.loadingService.hide(), 300);
      }
    });
  }

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/',
      },
      {
        label: 'Categories',
        icon: 'pi pi-list',
        items: [
          { label: 'Fiction', routerLink: ['/'] },
          { label: 'Non-Fiction', routerLink: ['/'] },
          { label: 'Science', routerLink: ['/'] },
          { label: 'Technology', routerLink: ['/'] },
          { label: 'History', routerLink: ['/'] },
        ],
      },
      {
        label: 'About',
        icon: 'pi pi-info-circle',
      },
    ];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.isLoggedIn = false;
    this.authService.logout();
  }
}
