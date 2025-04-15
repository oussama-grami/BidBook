import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private progressSubject = new BehaviorSubject<number>(0);
  private resourcesLoading = new Set<string>();
  private routeLoading = false;

  // Observable streams for components to subscribe to
  public loading$ = this.loadingSubject.asObservable();
  public loadingProgress$ = this.progressSubject.asObservable();

  constructor(private router: Router) {
    // Track router events to show/hide loading indicator
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.routeLoading = true;
          this.updateLoadingState();
          // Start with 20% progress when navigation begins
          this.progressSubject.next(20);

          // Simulate progress while waiting for navigation to complete
          let progress = 20;
          const interval = setInterval(() => {
            if (progress < 65 && this.routeLoading) {
              progress += 5;
              this.progressSubject.next(progress);
            } else {
              clearInterval(interval);
            }
          }, 250);
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.routeLoading = false;
          this.updateLoadingState();
          this.progressSubject.next(100);

          // Reset progress after a short delay
          setTimeout(() => {
            if (!this.loadingSubject.value) {
              this.progressSubject.next(0);
            }
          }, 300);
        }
      });
  }

  /**
   * Start tracking a resource that's loading
   * @param resourceId Unique identifier for the resource
   */
  startLoading(resourceId: string): void {
    this.resourcesLoading.add(resourceId);
    this.updateLoadingState();
  }

  /**
   * Stop tracking a resource that's done loading
   * @param resourceId Unique identifier for the resource
   */
  stopLoading(resourceId: string): void {
    this.resourcesLoading.delete(resourceId);
    this.updateLoadingState();
  }

  /**
   * Set a specific progress value
   * @param value Progress value (0-100)
   */
  setProgress(value: number): void {
    this.progressSubject.next(Math.min(100, Math.max(0, value)));
  }

  /**
   * Update the global loading state based on resources and route
   */
  private updateLoadingState(): void {
    const isLoading = this.routeLoading || this.resourcesLoading.size > 0;

    // Only emit when value changes to avoid unnecessary renders
    if (isLoading !== this.loadingSubject.value) {
      this.loadingSubject.next(isLoading);
    }
  }
}
