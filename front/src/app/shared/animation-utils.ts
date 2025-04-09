import { trigger, transition, style, animate, query, group, keyframes, state, stagger } from '@angular/animations';

/**
 * Enhanced Animation Utilities
 * A collection of reusable, elegant animations for the application
 */

// Fade animations with configurable duration
export const fadeInOut = (duration: string = '300ms') => trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(`${duration} cubic-bezier(0.4, 0.0, 0.2, 1)`, style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate(`${duration} cubic-bezier(0.4, 0.0, 0.2, 1)`, style({ opacity: 0 }))
  ])
]);

// Slide animations with configurable direction and duration
export const slideInOut = (direction: 'left' | 'right' | 'up' | 'down' = 'right', duration: string = '300ms') => {
  let initial: any, final: any;
  
  switch (direction) {
    case 'left':
      initial = { transform: 'translateX(-100%)', opacity: 0 };
      final = { transform: 'translateX(0)', opacity: 1 };
      break;
    case 'right':
      initial = { transform: 'translateX(100%)', opacity: 0 };
      final = { transform: 'translateX(0)', opacity: 1 };
      break;
    case 'up':
      initial = { transform: 'translateY(-100%)', opacity: 0 };
      final = { transform: 'translateY(0)', opacity: 1 };
      break;
    case 'down':
      initial = { transform: 'translateY(100%)', opacity: 0 };
      final = { transform: 'translateY(0)', opacity: 1 };
      break;
  }
  
  return trigger('slideInOut', [
    transition(':enter', [
      style(initial),
      animate(`${duration} cubic-bezier(0.4, 0.0, 0.2, 1)`, style(final))
    ]),
    transition(':leave', [
      animate(`${duration} cubic-bezier(0.4, 0.0, 0.2, 1)`, style(initial))
    ])
  ]);
};

// Scale animations for elements
export const scaleInOut = (duration: string = '300ms') => trigger('scaleInOut', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate(`${duration} cubic-bezier(0.4, 0.0, 0.2, 1)`, style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate(`${duration} cubic-bezier(0.4, 0.0, 0.2, 1)`, style({ transform: 'scale(0.8)', opacity: 0 }))
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

// Stagger animation for lists
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('60ms', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);


// Hover animation for interactive elements
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

// Elegant page transitions
export const pageTransition = trigger('pageTransition', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 1
      })
    ], { optional: true }),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ opacity: 0, transform: 'scale(0.95)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'scale(1.05)' }),
        animate('400ms 150ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ], { optional: true })
    ])
  ])
]);