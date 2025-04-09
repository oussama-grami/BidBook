import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-back-arrow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="back-arrow"
      (click)="goBack()"
      [@backButton]="buttonState"
      (mouseenter)="onHover(true)"
      (mouseleave)="onHover(false)"
    >
      <img src="/images/img.png" alt="Back" />
    </button>
  `,
  styles: [
    `
      .back-arrow {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 45px;
        height: 45px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        z-index: 996;
      }

      .back-arrow:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        background-color: rgba(255, 255, 255, 0.2);
      }

      .back-arrow img {
        width: 22px;
        height: 22px;
        opacity: 0.7;
        transition: opacity 0.3s ease;
      }

      .back-arrow:hover img {
        opacity: 1;
      }

      @media (max-width: 768px) {
        .back-arrow {
          top: 15px;
          right: 15px;
          width: 40px;
          height: 40px;
        }

        .back-arrow img {
          width: 20px;
          height: 20px;
        }
      }

      @media (max-width: 480px) {
        .back-arrow {
          top: 12px;
          right: 12px;
          width: 38px;
          height: 38px;
        }

        .back-arrow img {
          width: 18px;
          height: 18px;
        }
      }
    `,
  ],
  animations: [
    trigger('backButton', [
      state(
        'normal',
        style({
          transform: 'scale(1) rotate(0deg)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'scale(1.1) rotate(-10deg)',
        })
      ),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),
  ],
})
export class BackArrowComponent {
  buttonState = 'normal';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

  onHover(isHovered: boolean) {
    this.buttonState = isHovered ? 'hovered' : 'normal';
  }
}
