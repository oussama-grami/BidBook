import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-animated-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="animated-card" 
      [@cardAnimation]="animationState"
      [ngClass]="{'elegant-card': useElegantStyle}"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .animated-card {
      display: block;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      height: 100%;
      width: 100%;
    }
    
    .elegant-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      background-color: var(--surface-card, #ffffff);
      border: 1px solid rgba(0, 0, 0, 0.03);
      overflow: hidden;
    }
  `],
  animations: [
    trigger('cardAnimation', [
      state('idle', style({
        transform: 'translateY(0) scale(1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      })),
      state('hovered', style({
        transform: 'translateY(-5px) scale(1.02)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)'
      })),
      transition('idle => hovered', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('hovered => idle', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms 150ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AnimatedCardComponent {
  @Input() useElegantStyle: boolean = true;
  
  animationState: 'idle' | 'hovered' = 'idle';
  
  onMouseEnter() {
    this.animationState = 'hovered';
  }
  
  onMouseLeave() {
    this.animationState = 'idle';
  }
}