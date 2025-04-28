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
  zoomAnimation,
  rotateAnimation,
  slideUpAnimation,
  routeTransitionAnimations,
} from './shared/animations';
import { AuthService } from './services/auth.service';
import { first } from 'rxjs/operators';
import { LoadingComponent } from './components/loading/loading.component';
import { LoadingService } from './services/loading.service';

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
  animations: [
    fadeAnimation,
    slideAnimation,
    fadeScaleAnimation,
    pulseAnimation,
    zoomAnimation,
    rotateAnimation,
    slideUpAnimation,
    routeTransitionAnimations,
  ],
})
export class AppComponent implements OnInit {
  title = 'E-Books';
  menuItems: MenuItem[] = [];
  isLoggedIn: boolean = true;
  isSmallScreen: boolean = false;
  private applicationRef = inject(ApplicationRef);
  private ngZone = inject(NgZone);
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {
    // Run router events outside Angular zone to avoid stability issues
    this.ngZone.runOutsideAngular(() => {
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationStart) {
          // Navigation started
          this.ngZone.run(() => {
            // Using loadingService instead of directly setting isLoading
            // loadingService will handle this internally
          });
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // Navigation ended
          this.ngZone.run(() => {
            // Let loadingService handle the end of navigation
            setTimeout(() => {
              // Small delay for smoother transitions
            }, 300);
          });
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

    // Get the animation type from the route data
    const animation = outlet.activatedRoute.snapshot.data?.['animation'];

    // Map the animation string to the appropriate animation trigger
    switch (animation) {
      case 'fade':
        return 'fadeAnimation';
      case 'slideLeft':
        return 'slideAnimation';
      case 'slideUp':
        return 'slideUpAnimation';
      case 'zoom':
        return 'zoomAnimation';
      case 'rotate':
        return 'rotateAnimation';
      default:
        // Default to fade animation if none specified
        return 'fadeAnimation';
    }
  }
}
