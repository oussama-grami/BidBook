import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
  animations: [
    trigger('bounceAnimation', [
      state(
        'initial',
        style({
          transform: 'scale(1)',
        })
      ),
      state(
        'bounce',
        style({
          transform: 'scale(1)',
        })
      ),
      transition('initial => bounce', [
        animate(
          '1s',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.1)', offset: 0.2 }),
            style({ transform: 'scale(0.9)', offset: 0.4 }),
            style({ transform: 'scale(1.05)', offset: 0.6 }),
            style({ transform: 'scale(0.95)', offset: 0.8 }),
            style({ transform: 'scale(1)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('fadeIn', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'translateY(20px)',
        })
      ),
      transition('void => *', [
        animate(
          '0.6s ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class ErrorPageComponent implements OnInit {
  @Input() errorCode: number = 404;
  @Input() errorMessage: string = 'Page not found';

  animationState: 'initial' | 'bounce' = 'initial';

  // Customize messages based on error codes
  errorDetails: { [key: number]: { title: string; message: string } } = {
    404: {
      title: 'Page Not Found',
      message: "The page you are looking for doesn't exist or has been moved.",
    },
    500: {
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
    },
    403: {
      title: 'Access Denied',
      message: "You don't have permission to access this resource.",
    },
  };

  title: string = '';
  message: string = '';

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngOnInit() {
    // Try to get error code from route data first
    this.route.data.subscribe((data) => {
      if (data['errorCode']) {
        this.errorCode = data['errorCode'];
      }
    });

    // Then check route params (has higher priority)
    this.route.paramMap.subscribe((params) => {
      const codeParam = params.get('code');
      if (codeParam) {
        this.errorCode = parseInt(codeParam, 10);
      }
    });

    // Get custom messages or use defaults
    const errorInfo = this.errorDetails[this.errorCode] || {
      title: 'Error',
      message: this.errorMessage || 'Something went wrong',
    };

    this.title = errorInfo.title;
    this.message = errorInfo.message;

    // Trigger animation after a short delay
    setTimeout(() => {
      this.animationState = 'bounce';
    }, 300);
  }

  goBack() {
    this.location.back();
  }
}
