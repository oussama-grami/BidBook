import { Component, Input } from '@angular/core';
import { Book } from '../../ebooks/ebooks.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-card',
  templateUrl: './ebook-card.component.html',
  styleUrls: ['./ebook-card.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class EbookCardComponent {
  @Input() book!: {
    title: string;
    image: string;
    reviews: number;
    rating: number;
    author: string;
    description?: string;
    price?: string;
  };
}
