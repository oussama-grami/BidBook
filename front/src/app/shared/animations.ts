import {
  trigger,
  transition,
  style,
  animate,
  keyframes,
  state,
  query,
  stagger,
  group,
} from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0 })),
  ]),
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
    animate(
      '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ opacity: 1, transform: 'scale(1)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ opacity: 0, transform: 'scale(0.95)' })
    ),
  ]),
]);

// List item animation with stagger effect
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(60, [
          animate(
            '400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// Pulse animation for attention-grabbing elements
export const pulseAnimation = trigger('pulse', [
  state('pulse', style({ transform: 'scale(1)' })),
  transition('* => pulse', [
    animate(
      '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.05)', offset: 0.5 }),
        style({ transform: 'scale(1)', offset: 1.0 }),
      ])
    ),
  ]),
]);

// Elegant hover animation
export const hoverAnimation = trigger('hover', [
  state(
    'idle',
    style({
      transform: 'translateY(0) scale(1)',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    })
  ),
  state(
    'hovered',
    style({
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
    })
  ),
  transition('idle => hovered', [
    animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
  ]),
  transition('hovered => idle', [
    animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
  ]),
]);

// NEW ANIMATIONS FOR GLOBAL PAGE TRANSITIONS

// Page rotation animation for dramatic transitions
export const rotateAnimation = trigger('rotateAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'perspective(1200px) rotateY(90deg)' }),
    animate(
      '700ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ opacity: 1, transform: 'perspective(1200px) rotateY(0deg)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '700ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ opacity: 0, transform: 'perspective(1200px) rotateY(-90deg)' })
    ),
  ]),
]);

// Zoom animation for focused content
export const zoomAnimation = trigger('zoomAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(1.2)' }),
    animate(
      '600ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ opacity: 1, transform: 'scale(1)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ opacity: 0, transform: 'scale(0.8)' })
    ),
  ]),
]);

// Slide up animation for mobile-like transitions
export const slideUpAnimation = trigger('slideUpAnimation', [
  transition(':enter', [
    style({ transform: 'translateY(30%)', opacity: 0 }),
    animate(
      '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ transform: 'translateY(0)', opacity: 1 })
    ),
  ]),
  transition(':leave', [
    animate(
      '500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({ transform: 'translateY(30%)', opacity: 0 })
    ),
  ]),
]);

// Advanced route transition for container-based animations
export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* => *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    group([
      query(':leave', [animate('300ms ease-out', style({ opacity: 0 }))], {
        optional: true,
      }),
      query(
        ':enter',
        [
          style({ opacity: 0 }),
          animate('300ms ease-out', style({ opacity: 1 })),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);
