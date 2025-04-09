import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, ProgressBarModule],
  template: `
    <div class="loading-container" [@fadeInOut]="'in'">
      <div class="spinner-wrapper">
        <p-progress-spinner
          styleClass="custom-spinner"
          strokeWidth="3"
          fill="var(--surface-ground)"
          animationDuration=".7s"
        >
        </p-progress-spinner>
        <div class="loading-text">{{ loadingText }}</div>
        <div class="progress-container">
          <p-progressBar
            [value]="progress"
            [showValue]="false"
            styleClass="custom-progress"
          ></p-progressBar>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(5px);
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
      }

      .spinner-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        animation: scaleIn 0.4s ease-out;
        min-width: 200px;
      }

      .progress-container {
        width: 100%;
        margin-top: 0.5rem;
      }

      :host ::ng-deep .custom-progress {
        height: 6px;
        border-radius: 3px;
      }

      :host ::ng-deep .custom-progress .p-progressbar-value {
        background: var(--primary-color);
        transition: width 0.3s ease;
      }

      .loading-text {
        color: var(--primary-color);
        font-size: 1rem;
        font-weight: 500;
        opacity: 0.8;
        animation: pulse 1.5s ease-in-out infinite;
      }

      :host ::ng-deep .custom-spinner {
        width: 60px;
        height: 60px;
      }

      :host ::ng-deep .custom-spinner .p-progress-spinner-circle {
        stroke: var(--primary-color);
        stroke-linecap: round;
        animation: dash 1.5s ease-in-out infinite;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 0.6;
        }
        50% {
          opacity: 1;
        }
      }
    `,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class LoadingComponent implements OnInit, OnDestroy {
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Only subscribe to loading progress updates in browser environment
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
