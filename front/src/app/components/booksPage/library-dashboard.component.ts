import { Component, Input, signal, WritableSignal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCardComponent } from './book-card.component';
import { CategoryListComponent } from './category-bar.component';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { CategoryEnum } from '../../enums/category.enum';
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
export interface UserRating {
  id: number;
  user?: {
    id: number;
  };
  book?: number;
  rate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  picture: string;
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  comments?: {
    id: number;
    content: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  }[];
  favorites?: any[];
  bids?: any[];
  price?: number;
  totalPages?: number;
  damagedPages?: number;
  age?: number;
  edition?: number;
  language?: string;
  editor?: string;
  category?: string;
  ratings?: UserRating[];
  createdAt?: string;
  likes?: number;
}

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [CommonModule, BookCardComponent, CategoryListComponent],
  template: `
    <main class="catalog-container" [@fadeIn]>
      <h1 *ngIf="isFavorite()" class="favorites-title" [@slideInRight]>
        My Bids
      </h1>
      <app-category-list
        [categories]="categories"
        [selectedCategory]="selectedCategory"
        (categorySelected)="onCategoryChange($event)"
        (searchChanged)="onSearchChange($event)"
      >
      </app-category-list>

      <div *ngIf="loading">Loading books...</div>
      <div *ngIf="error">Error loading books: {{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <section class="explore-section">
          <h2 class="section-title" [@slideInRight]>Explore all books</h2>
          <div class="books-grid" [@booksAnimation]>
            <app-book-card *ngFor="let book of filteredExploreBooks" [book]="book"></app-book-card>
          </div>
        </section>
      </ng-container>
    </main>
  `,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate(
          '600ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('booksAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            stagger(100, [
              animate(
                '500ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  styles: [
    `
      .catalog-container {
        flex: 1;
        padding: 40px;
        background: linear-gradient(to bottom, #f8f9fa, #ffffff);
        min-height: 100vh;
      }

      .explore-section {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 20px;
        padding: 30px;
        margin-bottom: 40px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(10px);
        transition: transform 0.3s ease;
      }

      .explore-section:hover {
        transform: translateY(-5px);
      }

      .section-title {
        color: #9c7350;
        font-family: Poppins, sans-serif;
        font-size: 40px;
        margin-bottom: 40px;
        position: relative;
        display: inline-block;
      }

      .section-title::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 60px;
        height: 3px;
        background: linear-gradient(to right, #9c7350, transparent);
        border-radius: 2px;
      }

      .books-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
        margin-bottom: 40px;
      }

      @media (max-width: 991px) {
        .catalog-container {
          padding: 20px;
        }

        .explore-section {
          padding: 20px;
        }

        .section-title {
          font-size: 32px;
        }

        .books-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
      }

      @media (max-width: 640px) {
        .catalog-container {
          padding: 15px;
        }

        .explore-section {
          padding: 15px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 28px;
        }

        .books-grid {
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .section-title::after {
          width: 40px;
        }
      }

      .favorites-title {
        font-size: 48px;
        font-weight: bold;
        color: #9c7350;
        margin-bottom: 30px;
        font-family: Poppins, sans-serif;
        background: linear-gradient(45deg, #9c7350, #50719c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        position: relative;
      }

      .favorites-title::after {
        content: '❤️';
        position: absolute;
        margin-left: 15px;
        font-size: 36px;
      }

      @media (max-width: 991px) {
        .favorites-title {
          font-size: 40px;
        }
      }

      @media (max-width: 640px) {
        .favorites-title {
          font-size: 32px;
        }
      }
    `,
  ],
  providers: [Apollo, HttpLink, BookService],
})
export class BookCatalogComponent implements OnInit, OnDestroy {
  categories: CategoryEnum[] = [
    CategoryEnum.FICTION,
    CategoryEnum.NON_FICTION,
    CategoryEnum.SCIENCE,
    CategoryEnum.HISTORY,
    CategoryEnum.BIOGRAPHY,
    CategoryEnum.ROMANCE,
    CategoryEnum.OTHER,
    CategoryEnum.ADVENTURE,
    CategoryEnum.FANTASY,
    CategoryEnum.POETRY,
    CategoryEnum.ART,
    CategoryEnum.NOVEL,
    CategoryEnum.THRILLER,
    CategoryEnum.PHILOSOPHY,
    CategoryEnum.RELIGION,
    CategoryEnum.TECHNOLOGY,
    CategoryEnum.All,
  ];
  selectedCategory: CategoryEnum = CategoryEnum.All;
  isFavorite: WritableSignal<boolean> = signal(true);
  searchTerm = '';
  exploreBooks: Book[] = [];
  filteredExploreBooks: Book[] = [];
  loading = true;
  error: any;
  private querySubscription?: Subscription;

  @Input() data: string = '';

  constructor(
    private readonly ActivatedRoute: ActivatedRoute,
    private readonly bookDataService: BookService
  ) {
    this.ActivatedRoute.data.subscribe((data: any) => {
      this.isFavorite.set(data?.isFavorite);
    });
  }

  ngOnInit() {
    this.loading = true;
    this.querySubscription = this.bookDataService.viewBooks().subscribe({
      next: (books) => {
        this.exploreBooks = [...books];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        console.error('Error fetching books:', err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
  }

  onCategoryChange(category: CategoryEnum): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredExploreBooks = [...this.exploreBooks];

    if (this.selectedCategory.toUpperCase() !== 'ALL') {
      this.filteredExploreBooks = this.filteredExploreBooks.filter(
        (book) => book.category === this.selectedCategory.toUpperCase()
      );
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredExploreBooks = this.filteredExploreBooks.filter((book) =>
        book.title?.toLowerCase().includes(searchLower)
      );
    }
  }
}
