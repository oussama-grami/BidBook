import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-animated-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="animated-button"
      [ngClass]="{
        'primary': type === 'primary',
        'secondary': type === 'secondary',
        'outlined': type === 'outlined',
        'text': type === 'text',
        'small': size === 'small',
        'large': size === 'large'
      }"
      [@buttonAnimation]="animationState"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (mousedown)="onMouseDown()"
      (mouseup)="onMouseUp()"
      (click)="onClick()"
      [disabled]="disabled"
    >
      <div class="button-content">
        <i *ngIf="icon" [class]="icon"></i>
        <span *ngIf="label">{{ label }}</span>
        <ng-content></ng-content>
      </div>
      <div class="ripple-container" *ngIf="showRipple">
        <span 
          *ngFor="let ripple of ripples" 
          class="ripple"
          [style.left.px]="ripple.x"
          [style.top.px]="ripple.y"
          [@rippleAnimation]="'active'"
          (@rippleAnimation.done)="rippleAnimationDone(ripple)"
        ></span>
      </div>
    </button>
  `,
  styles: [`
    .animated-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      border: none;
      outline: none;
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      z-index: 2;
    }

    .primary {
      background: linear-gradient(90deg, var(--primary-color, #2D68FE), var(--primary-light-color, #5B8DEF));
      color: white;
      box-shadow: 0 2px 10px rgba(45, 104, 254, 0.2);
    }

    .secondary {
      background-color: var(--surface-card, #ffffff);
      color: var(--text-color, #333333);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .outlined {
      background-color: transparent;
      color: var(--primary-color, #2D68FE);
      border: 2px solid var(--primary-color, #2D68FE);
    }

    .text {
      background-color: transparent;
      color: var(--primary-color, #2D68FE);
      padding: 0.5rem 1rem;
      box-shadow: none;
    }

    .small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .large {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }

    .animated-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .ripple-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
    }

    .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.4);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* Dark mode support */
    :host-context(.dark-theme) .secondary {
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--text-color, #f0f0f0);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    :host-context(.dark-theme) .ripple {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `],
  animations: [
    trigger('buttonAnimation', [
      state('idle', style({
        transform: 'translateY(0)'
      })),
      state('hovered', style({
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      })),
      state('pressed', style({
        transform: 'translateY(1px)',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
      })),
      transition('idle => hovered', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('hovered => idle', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('hovered => pressed', [
        animate('100ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('pressed => hovered', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('pressed => idle', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),
    trigger('rippleAnimation', [
      transition(':enter', [
        style({ width: '0px', height: '0px', opacity: 1 }),
        animate('600ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ width: '500px', height: '500px', opacity: 0 }))
      ])
    ])
  ]
})
export class AnimatedButtonComponent {
  @Input() type: 'primary' | 'secondary' | 'outlined' | 'text' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  @Input() showRipple: boolean = true;
  
  @Output() buttonClick = new EventEmitter<MouseEvent>();
  
  animationState: 'idle' | 'hovered' | 'pressed' = 'idle';
  ripples: Array<{ id: number, x: number, y: number }> = [];
  private nextRippleId = 0;
  
  onMouseEnter() {
    if (!this.disabled) {
      this.animationState = 'hovered';
    }
  }
  
  onMouseLeave() {
    if (!this.disabled) {
      this.animationState = 'idle';
    }
  }
  
  onMouseDown() {
    if (!this.disabled) {
      this.animationState = 'pressed';
    }
  }
  
  onMouseUp() {
    if (!this.disabled) {
      this.animationState = 'hovered';
    }
  }
  
  onClick() {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
  
  addRipple(event: MouseEvent) {
    if (!this.showRipple || this.disabled) return;
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.ripples.push({ id: this.nextRippleId++, x, y });
  }
  
  rippleAnimationDone(ripple: { id: number, x: number, y: number }) {
    this.ripples = this.ripples.filter(r => r.id !== ripple.id);
  }
}