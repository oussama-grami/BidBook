import { trigger, transition, style, animate, query, group, sequence, animateChild } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  // Default animation - fade
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),
    query(':enter', [style({ opacity: 0, filter: 'blur(4px)' })], { optional: true }),
    query(':leave', [animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0, filter: 'blur(4px)' }))], { optional: true }),
    query(':enter', [animate('400ms 150ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, filter: 'blur(0)' }))], { optional: true }),
  ]),
  
  // Slide left animation (for forward navigation)
  transition('* => slideLeft', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('400ms ease-out', style({ transform: 'translateX(-100%)', opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 })),
      ], { optional: true }),
    ]),
  ]),
  
  // Slide right animation (for backward navigation)
  transition('* => slideRight', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ transform: 'translateX(100%)', opacity: 0, filter: 'blur(4px)' })),
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0, filter: 'blur(4px)' }),
        animate('500ms 100ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ transform: 'translateX(0%)', opacity: 1, filter: 'blur(0)' })),
      ], { optional: true }),
    ]),
  ]),
  
  // Zoom animation
  transition('* => zoom', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),
    query(':leave', [
      animate('300ms ease-out', style({ transform: 'scale(0.8)', opacity: 0 })),
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'scale(1.2)', opacity: 0 }),
      animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
    ], { optional: true }),
  ]),
]);

// Component-specific animations for entry and exit
export const componentAnimations = trigger('componentAnimations', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    sequence([
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      query('@*', animateChild(), { optional: true })
    ])
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
  ])
]);

// Staggered list item animations
export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ], { optional: true }),
  ]),
]);

// Content loaded animation
export const contentLoadedAnimation = trigger('contentLoaded', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms 100ms ease-out', style({ opacity: 1 })),
  ]),
]);