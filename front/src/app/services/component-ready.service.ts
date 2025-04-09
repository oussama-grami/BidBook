import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from './loading.service';
import { RouteTransitionService } from './route-transition.service';

@Injectable({
  providedIn: 'root',
})
export class ComponentReadyService {
  private componentReady = new BehaviorSubject<boolean>(false);
  public componentReady$ = this.componentReady.asObservable();
  
  // Track loading progress for individual components
  private progressSubject = new Subject<number>();
  public progress$ = this.progressSubject.asObservable();
  
  // Track if we're in browser or server environment
  private isBrowser: boolean;
  
  constructor(
    private loadingService: LoadingService,
    private routeTransitionService: RouteTransitionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // In SSR, we start with ready state to avoid hydration issues
    if (!this.isBrowser) {
      this.componentReady.next(true);
    }
  
  /**
   * Mark a component as ready, which will hide the loading spinner
   * and trigger entry animations
   */
  setReady(delay: number = 0) {
    // Update progress to 100%
    this.updateProgress(100);
    
    // In SSR, immediately mark as ready without delay to avoid hydration issues
    if (!this.isBrowser) {
      this.componentReady.next(true);
      this.routeTransitionService.markAsLoaded();
      this.loadingService.hideImmediate();
      return;
    }
    
    // In browser, add a small delay to ensure smooth transitions
    setTimeout(() => {
      this.componentReady.next(true);
      this.routeTransitionService.markAsLoaded();
      
      // Hide loading spinner after component is ready
      this.loadingService.hide();
    }, delay);
  }
  
  /**
   * Reset the ready state when navigating to a new route
   */
  reset() {
    // Skip reset in SSR to avoid hydration issues
    if (!this.isBrowser) {
      return;
    }
    
    this.componentReady.next(false);
    this.progressSubject.next(0);
    
    // Add a safety timeout to prevent infinite loading state
    // Reduced timeout to prevent hydration issues
    setTimeout(() => {
      if (!this.componentReady.value) {
        console.log('Force completing component ready state after timeout');
        this.setReady(0);
      }
    }, 2000); // Reduced from 4s to 2s to help with hydration
  }
  
  /**
   * Update the loading progress (0-100)
   */
  updateProgress(progress: number) {
    // Skip progress updates in SSR to avoid hydration issues
    if (!this.isBrowser) {
      return;
    }
    
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);
    this.progressSubject.next(normalizedProgress);
    this.loadingService.updateProgress(normalizedProgress);
    
    // If progress is 100%, ensure we mark as ready to help with hydration
    if (normalizedProgress === 100) {
      // Small timeout to allow other operations to complete
      setTimeout(() => {
        this.componentReady.next(true);
        this.routeTransitionService.markAsLoaded();
      }, 0);
    }
  }
  
  /**
   * Get the current ready state
   */
  isReady(): Observable<boolean> {
    return this.componentReady$;
  }
}