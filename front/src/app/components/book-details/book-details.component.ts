import { Component, Input } from '@angular/core';
import { NgForOf, NgIf, Location } from '@angular/common';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  imports: [NgForOf, NgIf],
  styleUrls: ['./book-details.component.css'],
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

  constructor(private location: Location) {}

  setUserRating(rating: number): void {
    this.userRating = rating;
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  goBack(): void {
    this.location.back();
  }
}
