import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <div class="spinner-wrapper">
        <p-progress-spinner
          styleClass="custom-spinner"
          strokeWidth="3"
          fill="var(--surface-ground)"
          animationDuration=".7s"
        >
        </p-progress-spinner>
        <div class="loading-text">Loading...</div>
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
})
export class LoadingComponent {}
