import { Component, Input } from '@angular/core';
import { NgForOf } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { BackArrowComponent } from '../navigation/back-arrow.component';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  standalone: true,
  imports: [NgForOf, BackArrowComponent],
  styleUrls: ['./book-details.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '0.5s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('scaleHeart', [
      transition('* => *', [
        animate('0.3s', style({ transform: 'scale(1.3)' })),
        animate('0.2s', style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('starRating', [
      state(
        'inactive',
        style({
          transform: 'scale(1)',
          opacity: '0.5',
        })
      ),
      state(
        'active',
        style({
          transform: 'scale(1.2)',
          opacity: '1',
        })
      ),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out')),
    ]),
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
export class BookDetailsComponent {
  @Input() title: string = 'hello';
  @Input() author: string = 'Mohamed Aziz';
  @Input() genre: string = 'Comedy';
  @Input() rating: number = 4;
  @Input() votes: number = 5200;
  @Input() pages: number = 145;
  @Input() coverImage: string = '/images/Book1.png';
  @Input() description: string =
    'This is a description of the book. It provides an overview of the content and themes covered in the book. The book is a thrilling adventure that takes the reader on a journey through time and space, exploring the depths of human emotion and experience. It is a must-read for anyone who loves a good story.';

  userRating: number = 0;
  isFavorite: boolean = false;
  starStates: string[] = Array(5).fill('inactive');

  setUserRating(rating: number): void {
    this.userRating = rating;
    this.starStates = this.starStates.map((_, index) =>
      index < rating ? 'active' : 'inactive'
    );
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }
}
