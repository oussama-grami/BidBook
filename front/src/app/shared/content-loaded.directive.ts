import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from '../services/loading.service';
import { RouteTransitionService } from '../services/route-transition.service';

@Directive({
  selector: '[appContentLoaded]',
  standalone: true,
})
export class ContentLoadedDirective implements OnInit, OnDestroy {
  @Input() delay = 0; // Optional delay before marking content as loaded
  @Output() contentLoaded = new EventEmitter<boolean>();
  private observer: MutationObserver | null = null;
  private timeout: any = null;
  private imagesLoaded = false;
  private domLoaded = false;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private loadingService: LoadingService,
    private routeTransitionService: RouteTransitionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Always mark as loaded in SSR to avoid blocking hydration
    if (!this.isBrowser) {
      this.contentLoaded.emit(true);
      this.routeTransitionService.markAsLoaded();
      this.loadingService.hideImmediate(); // Force hide loading in SSR
      return;
    }
    
    // For browser environment
    // Set a safety timeout to ensure we don't block hydration
    // Reduced timeout to prevent long loading screens
    setTimeout(() => {
      if (!this.domLoaded || !this.imagesLoaded) {
        console.log('Forcing content loaded state after timeout to prevent hydration issues');
        this.forceContentLoaded();
      }
    }, 2000); // Reduced from 5s to 2s for better user experience
    
    // Add an immediate micro-timeout to help with hydration
    setTimeout(() => {
      // Check if we're in a hydration scenario (initial page load)
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        this.domLoaded = true;
        // Force check for content loaded state
        this.checkContentLoaded();
      }
    }, 0);
    
    // Start observing DOM changes
    this.observeDomChanges();
    
    // Check for images that need to load
    this.checkImagesLoaded();
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    }
  }

  private observeDomChanges() {
    if (!this.isBrowser) return;
    
    // Create a new MutationObserver to watch for DOM changes
    this.observer = new MutationObserver((mutations) => {
      // When DOM changes are detected, check if content is fully loaded
      this.checkContentLoaded();
    });

    // Start observing the target element for configured mutations
    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Initial check
    this.domLoaded = true;
    this.checkContentLoaded();
  }

  private checkImagesLoaded() {
    if (!this.isBrowser) {
      this.imagesLoaded = true;
      return;
    }
    
    const images = this.el.nativeElement.querySelectorAll('img');
    
    if (images.length === 0) {
      this.imagesLoaded = true;
      this.checkContentLoaded();
      return;
    }

    let loadedImages = 0;
    
    images.forEach((img: HTMLImageElement) => {
      if (img.complete) {
        loadedImages++;
      } else {
        img.addEventListener('load', () => {
          loadedImages++;
          if (loadedImages === images.length) {
            this.imagesLoaded = true;
            this.checkContentLoaded();
          }
        });
        
        img.addEventListener('error', () => {
          loadedImages++;
          if (loadedImages === images.length) {
            this.imagesLoaded = true;
            this.checkContentLoaded();
          }
        });
      }
    });
    
    if (loadedImages === images.length) {
      this.imagesLoaded = true;
      this.checkContentLoaded();
    }
  }

  private checkContentLoaded() {
    if (!this.isBrowser) return;
    
    if (this.domLoaded && this.imagesLoaded) {
      // Clear any existing timeout
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      
      // Add a small delay to ensure everything is rendered properly
      this.timeout = setTimeout(() => {
        this.contentLoaded.emit(true);
        this.routeTransitionService.markAsLoaded();
        this.loadingService.hide();
        
        // Add a safety fallback to ensure loading is hidden
        setTimeout(() => {
          // We need to access the BehaviorSubject value directly to check current state
          // This ensures we don't have an infinite loading screen
          this.loadingService.hideImmediate();
        }, 300);
      }, this.delay);
    }
  }
  
  // Force content to be marked as loaded (used as a fallback)
  private forceContentLoaded() {
    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.domLoaded = true;
    this.imagesLoaded = true;
    this.contentLoaded.emit(true);
    this.routeTransitionService.markAsLoaded();
    
    // Use hideImmediate instead of hide to ensure loading spinner disappears
    this.loadingService.hideImmediate();
    
    // Add a safety timeout to ensure all loading states are reset
    setTimeout(() => {
      // Double-check that loading is hidden
      this.loadingService.hideImmediate();
      // Ensure route transition is marked as loaded
      this.routeTransitionService.markAsLoaded();
    }, 100);
  }
}