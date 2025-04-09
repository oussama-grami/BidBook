import { trigger, transition, style, animate, keyframes, state, query, stagger } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 }))]),
]);

export const slideAnimation = trigger('slideAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0, filter: 'blur(4px)' }),
    animate(
      '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ transform: 'translateX(0)', opacity: 1, filter: 'blur(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ transform: 'translateX(-100%)', opacity: 0, filter: 'blur(4px)' })
    ),
  ]),
]);

// Enhanced fade animation with scale effect
export const fadeScaleAnimation = trigger('fadeScaleAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
      style({ opacity: 1, transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
      style({ opacity: 0, transform: 'scale(0.95)' }))
  ])
]);

// List item animation with stagger effect
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(60, [
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

// Pulse animation for attention-grabbing elements
export const pulseAnimation = trigger('pulse', [
  state('pulse', style({ transform: 'scale(1)' })),
  transition('* => pulse', [
    animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1.0 })
    ]))
  ])
]);

// Elegant hover animation
export const hoverAnimation = trigger('hover', [
  state('idle', style({
    transform: 'translateY(0) scale(1)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  })),
  state('hovered', style({
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.1)'
  })),
  transition('idle => hovered', [
    animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
  ]),
  transition('hovered => idle', [
    animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
  ])
]);
