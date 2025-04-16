import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, ProgressBarModule],
  template: `
    <div class="loading-backdrop" *ngIf="displayLoader" [@fadeAnimation]>
      <div class="spinner-wrapper">
        <div class="elegant-spinner">
          <div class="spinner-inner"></div>
          <div class="spinner-inner-secondary"></div>
        </div>
        <div class="loading-text">{{ loadingText }}</div>
        <div class="progress-container">
          <p-progressBar
            [value]="progress"
            [showValue]="false"
            styleClass="custom-progress"
          ></p-progressBar>
        </div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .loading-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.7);
        z-index: 9999;
      }

      .spinner-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        animation: pulse 2s infinite ease-in-out;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        50% {
          box-shadow: 0 10px 30px rgba(156, 115, 80, 0.15);
        }
        100% {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      }

      .elegant-spinner {
        width: 60px;
        height: 60px;
        position: relative;
        margin-bottom: 1rem;
      }

      .spinner-inner {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #9c7350;
        animation: spin 1.5s linear infinite;
      }

      .spinner-inner-secondary {
        position: absolute;
        width: 80%;
        height: 80%;
        top: 10%;
        left: 10%;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #50719c;
        animation: spin 2s linear infinite reverse;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .loading-dots {
        display: flex;
        margin-top: 0.5rem;
      }

      .loading-dots span {
        width: 8px;
        height: 8px;
        margin: 0 4px;
        border-radius: 50%;
        background-color: #9c7350;
        animation: dots 1.5s infinite ease-in-out;
      }

      .loading-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .loading-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes dots {
        0%,
        100% {
          transform: scale(0.6);
          opacity: 0.6;
        }
        50% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .progress-container {
        width: 100%;
        margin-top: 0.5rem;
        position: relative;
        overflow: hidden;
        border-radius: 8px;
      }

      :host ::ng-deep .custom-progress {
        height: 6px;
        border-radius: 8px;
        overflow: hidden;
      }

      :host ::ng-deep .custom-progress .p-progressbar-value {
        background: linear-gradient(90deg, #9c7350, #50719c);
        box-shadow: 0 0 10px rgba(156, 115, 80, 0.5);
        animation: shimmer-progress 2s infinite linear;
        background-size: 200% 100%;
        transition: width 0.3s ease;
      }

      @keyframes shimmer-progress {
        0% {
          background-position: 100% 0;
        }
        100% {
          background-position: -100% 0;
        }
      }

      .loading-text {
        margin: 1rem 0;
        font-size: 1.2rem;
        color: #333;
        font-weight: 500;
        letter-spacing: 0.5px;
        background: linear-gradient(90deg, #9c7350, #50719c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 2s infinite linear;
      }

      @keyframes shimmer {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }
    `,
  ],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class LoadingComponent implements OnInit, OnDestroy {
  isLoading = false;
  displayLoader = false;
  progress: number = 0;
  loadingText: string = 'Loading...';
  private subscription: Subscription = new Subscription();
  private loadingTexts: string[] = [
    'Loading...',
    'Almost there...',
    'Preparing content...',
    'Just a moment...',
  ];
  private textInterval: any;
  private isBrowser: boolean;

  constructor(
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Subscribe to loading status
      this.subscription.add(
        this.loadingService.loading$.subscribe((isLoading: boolean) => {
          this.isLoading = isLoading;

          if (isLoading) {
            // Show the loader immediately
            this.displayLoader = true;
            document.body.style.overflow = 'hidden'; // Prevent scrolling when loading
            this.cdr.detectChanges();
          } else {
            // Clean up and remove the loader
            document.body.style.overflow = ''; // Restore scrolling

            // Use setTimeout to allow any CSS transitions to complete
            setTimeout(() => {
              this.displayLoader = false;
              this.cdr.detectChanges();
            }, 300);
          }
        })
      );

      // Subscribe to loading progress updates
      this.subscription.add(
        this.loadingService.loadingProgress$.subscribe((progress: number) => {
          this.progress = progress;
          this.updateLoadingText(progress);
        })
      );

      // Only start text cycle in browser environment
      this.startTextCycle();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      document.body.style.overflow = ''; // Reset overflow in case component is destroyed while loading
      this.subscription.unsubscribe();
      if (this.textInterval) {
        clearInterval(this.textInterval);
      }
    }
  }

  private startTextCycle() {
    if (this.isBrowser) {
      let index = 0;
      this.textInterval = setInterval(() => {
        this.loadingText = this.loadingTexts[index];
        index = (index + 1) % this.loadingTexts.length;
      }, 2000);
    }
  }

  private updateLoadingText(progress: number) {
    if (this.isBrowser) {
      if (progress > 80) {
        this.loadingText = 'Almost there...';
      } else if (progress > 50) {
        this.loadingText = 'Preparing content...';
      }
    }
  }
}
