import { Component, Input } from '@angular/core';
import {NgForOf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-ebook-card',
  templateUrl: './ebook-card.component.html',
  imports: [
    NgOptimizedImage,
    NgForOf
  ],
  styleUrls: ['./ebook-card.component.css']
})
export class EbookCardComponent {
  @Input() title: string = '';
  @Input() author: string = '';
  @Input() coverImage: string = '';
  @Input() price: string = '';
  @Input() rating: number = 0; // New input for rating
  @Input() description: string = ''; // New input for description
}
