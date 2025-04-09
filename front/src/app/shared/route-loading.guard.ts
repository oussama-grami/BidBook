import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap, first } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { RouteTransitionService } from '../services/route-transition.service';
import { ApplicationRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RouteLoadingGuard implements CanActivate {
  constructor(
    private loadingService: LoadingService,
    private routeTransitionService: RouteTransitionService,
    private appRef: ApplicationRef
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Show loading indicator
    this.loadingService.show();
    
    // Reset component loaded state
    this.routeTransitionService.resetLoadingState();
    
    // Simulate a minimum loading time to ensure animations are visible
    // This can be adjusted or removed in production if not needed
    return of(true).pipe(
      delay(300), // Minimum delay to ensure loading animation is visible
      tap(() => {
        // Start with some progress to indicate route is loading
        this.loadingService.updateProgress(30);
        
        // Check application stability
        this.appRef.isStable.pipe(first((isStable: boolean) => isStable)).subscribe(() => {
          // Perform post-hydration cleanup
          this.loadingService.updateProgress(100);
        });
      })
    );
  }
}