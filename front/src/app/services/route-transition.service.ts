import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RouteTransitionService {
  // Track whether a component is fully loaded
  private componentLoaded = new BehaviorSubject<boolean>(false);
  public componentLoaded$ = this.componentLoaded.asObservable();

  // Track the current animation state
  private animationState = new BehaviorSubject<string>('initial');
  public animationState$ = this.animationState.asObservable();
  
  // Track if we're in browser or server environment
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // In SSR, we start with loaded state to avoid hydration issues
    if (!this.isBrowser) {
      this.componentLoaded.next(true);
    }
  }

  // Set component as loaded
  markAsLoaded() {
    this.componentLoaded.next(true);
  }

  // Reset loading state when starting a new navigation
  resetLoadingState() {
    // Only reset in browser environment to avoid hydration issues
    if (this.isBrowser) {
      this.componentLoaded.next(false);
      
      // Add a safety timeout to ensure loading state is eventually reset
      // This prevents infinite loading screens
      setTimeout(() => {
        if (!this.componentLoaded.value) {
          console.log('Force completing loading cycle after timeout');
          this.markAsLoaded();
        }
      }, 1000); // Reduced from 3s to 1s to help with hydration
    }
  }

  // Set the animation state
  setAnimationState(state: string) {
    this.animationState.next(state);
  }
}