import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCardComponent } from './book-card.component';
import { CategoryListComponent } from './category-bar.component';

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
  selector: 'app-book-catalog',
  standalone: true,
  imports: [CommonModule, BookCardComponent, CategoryListComponent],
  template: `
    <main class="catalog-container">
      <app-category-list
        [categories]="categories"
        [selectedCategory]="selectedCategory"
        (categorySelected)="onCategoryChange($event)"
      >
      </app-category-list>

      <section class="recommended-section">
        <h2 class="section-title">Recommended</h2>
        <div class="books-grid">
          <app-book-card
            *ngFor="let book of recommendedBooks"
            [book]="book"
            [special]="true"
          >
          </app-book-card>
        </div>
      </section>

      <section class="explore-section">
        <h2 class="section-title">Explore other books</h2>
        <div class="books-grid">
          <app-book-card *ngFor="let book of exploreBooks" [book]="book">
          </app-book-card>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      .catalog-container {
        flex: 1;
        padding: 40px;
      }

      .section-title {
        color: #9c7350;
        font-family: Poppins, sans-serif;
        font-size: 40px;
        margin-bottom: 40px;
      }

      .books-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
        margin-bottom: 60px;
      }

      @media (max-width: 991px) {
        .books-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 640px) {
        .books-grid {
          grid-template-columns: 1fr;
        }

        .section-title {
          font-size: 30px;
        }
      }
    `,
  ],
})
export class BookCatalogComponent {
  categories: BookCategory[] = [
    'Fiction',
    'Romance',
    'Thriller',
    'Fantasy',
    'Biography',
    'All',
  ];
  selectedCategory: BookCategory = 'All';

  recommendedBooks: Book[] = [
    {
      id: '1',
      title: 'Rich People Problems',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/ecdb6bbc8f17b31efa69a312a172d604f72a9214',
      rating: 4,
      comments: 97,
      daysAgo: 20,
    },
    {
      id: '2',
      title: 'Rich People Problems',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/ecdb6bbc8f17b31efa69a312a172d604f72a9214',
      rating: 4,
      comments: 97,
      daysAgo: 20,
    },
    {
      id: '3',
      title: 'Rich People Problems',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/ecdb6bbc8f17b31efa69a312a172d604f72a9214',
      rating: 4,
      comments: 97,
      daysAgo: 20,
    },
  ];

  exploreBooks: Book[] = [
    {
      id: '4',
      title: 'Rich People Problems',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/ecdb6bbc8f17b31efa69a312a172d604f72a9214',
      rating: 4,
      comments: 97,
      daysAgo: 20,
    },
    {
      id: '5',
      title: 'Rich People Problems',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/ecdb6bbc8f17b31efa69a312a172d604f72a9214',
      rating: 4,
      comments: 97,
      daysAgo: 20,
    },
    {
      id: '6',
      title: 'Rich People Problems',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/ecdb6bbc8f17b31efa69a312a172d604f72a9214',
      rating: 4,
      comments: 97,
      daysAgo: 20,
    },
  ];

  onCategoryChange(category: BookCategory): void {
    this.selectedCategory = category;
    // Here you would typically filter books based on category
  }
}
