import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface Book {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  comments: number;
  daysAgo: number;
}

export type BookCategory =
  | 'Fiction'
  | 'Romance'
  | 'Thriller'
  | 'Fantasy'
  | 'Biography'
  | 'All';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="book-card" [class.book-card-special]="special">
      <div class="book-image-container">
        <img [src]="book.imageUrl" [alt]="book.title" class="book-cover" />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/79485267c2027ed9781f317da7b890ef07ea6e9d"
          alt="Heart icon"
          class="heart-icon"
        />
      </div>
      <div class="book-details">
        <h3 class="book-title">{{ book.title }}</h3>
        <div class="rating-container">
          <div
            class="star-rating"
            role="img"
            [attr.aria-label]="'Rating: ' + book.rating + ' out of 5 stars'"
          >
            <i
              *ngFor="let star of [1, 2, 3, 4, 5]"
              class="pi"
              [class.pi-star-fill]="star <= book.rating"
              [class.pi-star]="star > book.rating"
              [class.empty]="star > book.rating"
              aria-hidden="true"
            >
            </i>
          </div>
          <div class="comment-count">
            <i class="pi pi-comments" aria-hidden="true"></i>
            <span>{{ book.comments }}</span>
          </div>
        </div>
        <p class="days-ago">
          <strong>{{ book.daysAgo }}D</strong>
        </p>
        <button class="view-details-btn">View details</button>
      </div>
    </article>
  `,
  styles: [
    `
      .book-card {
        border-radius: 30px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #f6f6f6;
        transition: all 0.3s ease;
      }

      .book-card-special {
        background: linear-gradient(145deg, #f6f6f6, #ffffff);
        box-shadow: 0 15px 30px rgba(156, 115, 80, 0.2);
        transform: scale(1.02);
        border: 2px solid rgba(156, 115, 80, 0.1);
      }

      .book-card-special .book-title {
        color: #9c7350;
        font-weight: 600;
      }

      .book-card-special .view-details-btn {
        background-color: #9c7350;
        box-shadow: 0 4px 15px rgba(156, 115, 80, 0.3);
      }

      .book-card-special .book-cover {
        box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
      }

      .book-image-container {
        position: relative;
        margin-bottom: 20px;
      }

      .book-cover {
        width: 94px;
        height: 160px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .heart-icon {
        position: absolute;
        top: 10px;
        right: -40px;
        width: 33px;
        height: 33px;
      }

      .book-details {
        text-align: center;
      }

      .book-title {
        color: #000;
        font-family: Poppins, sans-serif;
        font-size: 15px;
        text-transform: capitalize;
        margin-bottom: 10px;
      }

      .rating-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-bottom: 10px;
      }

      .star-rating {
        display: flex;
        gap: 7px;
        color: #ffb543;
      }

      .empty {
        color: #c5c5c5;
      }

      .comment-count {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #81859c;
        font-family: Inter, sans-serif;
        font-size: 13px;
      }

      .days-ago {
        color: #000;
        font-family: Poppins, sans-serif;
        font-size: 36px;
        font-weight: 300;
        margin-bottom: 20px;
      }

      .view-details-btn {
        color: #fff;
        font-family: Poppins, sans-serif;
        font-size: 14px;
        padding: 10px 30px;
        border-radius: 20px;
        border: none;
        cursor: pointer;
        background-color: #50719c;
      }
    `,
  ],
})
export class BookCardComponent {
  @Input() book!: Book;
  @Input() special: boolean = false;
}
