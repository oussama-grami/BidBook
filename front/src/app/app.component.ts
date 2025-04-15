import {
  Component,
  OnInit,
  ApplicationRef,
  NgZone,
  inject,
} from '@angular/core';
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
import {
  fadeAnimation,
  slideAnimation,
  fadeScaleAnimation,
  pulseAnimation,
} from './shared/animations';
import { AuthService } from './services/auth.service';
import { first } from 'rxjs/operators';
import { ScrollTop } from 'primeng/scrolltop';
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
    ScrollTop,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    fadeAnimation,
    slideAnimation,
    fadeScaleAnimation,
    pulseAnimation,
  ],
})
export class AppComponent implements OnInit {
  title = 'E-Books';
  menuItems: MenuItem[] = [];
  isLoggedIn: boolean = true;
  isSmallScreen: boolean = false;
  private applicationRef = inject(ApplicationRef);
  private ngZone = inject(NgZone);

  constructor(private router: Router, private authService: AuthService) {
    // Run router events outside Angular zone to avoid stability issues
    this.ngZone.runOutsideAngular(() => {
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationStart) {
          // Navigation started
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // Navigation ended
        }
      });
    });

    // Wait for application stability
    this.applicationRef.isStable
      .pipe(first((isStable) => isStable))
      .subscribe(() => {
        console.log('Application is now stable');
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

  getRouteAnimationState(outlet: RouterOutlet) {
    if (!outlet.isActivated) return '';
    return outlet.activatedRoute.snapshot.data?.['animation'] || 'slideLeft';
  }
}
