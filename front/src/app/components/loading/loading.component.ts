import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <p-progress-spinner
        styleClass="custom-spinner"
        strokeWidth="4"
        fill="var(--surface-ground)"
        animationDuration="1s"
      >
      </p-progress-spinner>
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
        background-color: rgba(255, 255, 255, 0.8);
        z-index: 1000;
      }
      :host ::ng-deep .custom-spinner {
        width: 50px;
        height: 50px;
      }
      :host ::ng-deep .custom-spinner .p-progress-spinner-circle {
        stroke: var(--primary-color);
        stroke-width: 3;
      }
    `,
  ],
})
export class LoadingComponent {}
