import {Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Article} from '../articlesPage/articleCard.component';

@Component({
  selector: 'app-blog',
  imports: [
    DatePipe
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  @Input()
  article: Article = {
    id: '1',
    title: 'The Timeless Appeal of Fiction Books',
    description: 'Fiction books have the power to transport readers to new worlds, introduce' +
      ' them to unforgettable characters, and evoke deep emotions. Whether through epic adventures, heartfelt dramas, or mind-bending mysteries, fiction allows us to experience stories beyond our own reality. From classic novels to modern bestsellers, these books continue to captivate and inspire generations of readers.',
    category: 'Fiction',
    author: 'Hiba Chabbouh',
    date: '01.03.2025',
    imageUrl: ''
  };

  protected readonly Date = Date;
}
