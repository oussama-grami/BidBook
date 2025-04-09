import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-elegant-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="elegant-loading-container" [@fadeInOut]>
      <div class="loading-content">
        <div class="spinner-container">
          <div class="spinner">
            <div class="spinner-inner"></div>
          </div>
        </div>
        <div class="loading-text" *ngIf="showText">
          <div class="text">{{ text }}</div>
          <div class="dots">
            <span [@dotAnimation]="'dot1'"></span>
            <span [@dotAnimation]="'dot2'"></span>
            <span [@dotAnimation]="'dot3'"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .elegant-loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      z-index: 9999;
    }
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      border-radius: 16px;
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .spinner-container {
      margin-bottom: 1.5rem;
    }
    
    .spinner {
      width: 60px;
      height: 60px;
      position: relative;
      animation: rotate 2s linear infinite;
    }
    
    .spinner-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: var(--primary-color, #2D68FE);
      border-right-color: var(--primary-light-color, #5B8DEF);
      position: absolute;
    }
    
    .loading-text {
      display: flex;
      align-items: center;
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
    }
    
    .dots {
      display: flex;
      margin-left: 8px;
    }
    
    .dots span {
      width: 6px;
      height: 6px;
      margin: 0 2px;
      border-radius: 50%;
      background-color: var(--primary-color, #2D68FE);
      display: inline-block;
    }
    
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Dark mode support */
    :host-context(.dark-theme) .elegant-loading-container {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    :host-context(.dark-theme) .loading-content {
      background-color: rgba(30, 30, 30, 0.9);
    }
    
    :host-context(.dark-theme) .loading-text {
      color: #f0f0f0;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 }))
      ])
    ]),
    trigger('dotAnimation', [
      transition('* => *', [
        animate('1500ms ease-in-out', keyframes([
          style({ opacity: 0.2, transform: 'scale(0.8)', offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.2)', offset: 0.5 }),
          style({ opacity: 0.2, transform: 'scale(0.8)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class ElegantLoadingComponent {
  @Input() text: string = 'Loading';
  @Input() showText: boolean = true;
}