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
import { LoadingComponent } from './components/loading/loading.component';
import { LoadingService } from './services/loading.service';
import { fadeAnimation, slideAnimation } from './shared/animations';
import { routeAnimations } from './shared/route-animations';
import { AuthService } from './services/auth.service';
import { RouteTransitionService } from './services/route-transition.service';
import { first } from 'rxjs/operators';

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
  animations: [fadeAnimation, slideAnimation, routeAnimations],
})
export class AppComponent implements OnInit {
  title = 'E-Books';
  menuItems: MenuItem[] = [];
  isLoggedIn: boolean = true;
  isSmallScreen: boolean = false;
  private applicationRef = inject(ApplicationRef);
  private ngZone = inject(NgZone);

  constructor(
    private router: Router,
    public loadingService: LoadingService,
    private authService: AuthService
  ) {
    // Run router events outside Angular zone to avoid stability issues
    this.ngZone.runOutsideAngular(() => {
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationStart) {
          this.ngZone.run(() => this.loadingService.show());
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // Small delay to ensure view is ready
          setTimeout(() => {
            this.ngZone.run(() => this.loadingService.hide());
          }, 100);
        }
      });
    });

    // Wait for application stability
    this.applicationRef.isStable
      .pipe(first((isStable) => isStable))
      .subscribe(() => {
        console.log('Application is now stable');
        this.loadingService.hide();
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

    const animation =
      outlet.activatedRoute.snapshot.data?.['animation'] || 'slideLeft';
    return animation;
  }
}
