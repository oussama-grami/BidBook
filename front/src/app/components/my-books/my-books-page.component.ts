import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryListComponent } from '../booksPage/category-bar.component';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { CategoryEnum } from '../../enums/category.enum';
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { UserIdService } from '../../services/userid.service';
import { Book } from '../../services/book.service';
import { MyBookCardComponent } from './my-book-card.component';

@Component({
  selector: 'app-my-books-page',
  standalone: true,
  imports: [CommonModule, MyBookCardComponent, CategoryListComponent], // Use BookCardComponent in imports
  templateUrl: './my-books-page.component.html',
  styleUrls: ['./my-books-page.component.css'],
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
})
export class MyBooksPageComponent implements OnInit, OnDestroy {
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
  searchTerm = '';
  myBooks: Book[] = [];
  filteredMyBooks: Book[] = [];
  loading = true;
  error: any;
  private querySubscription?: Subscription;

  constructor(
    private readonly bookService: BookService,
    private readonly userIdService: UserIdService,
  ) {}

  ngOnInit() {
    this.loadMyBooks();
  }

  loadMyBooks(): void {
    this.loading = true;
    const userId = this.userIdService.getUserId();
    if (userId) {
      this.querySubscription = this.bookService.getMyBooks().subscribe({
        next: (books) => {
          this.myBooks = [...books];
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          this.error = err;
          this.loading = false;
          console.error('Error fetching your books:', err);
        },
      });
    } else {
      console.warn('User ID not available, cannot fetch my books.');
      this.loading = false;
      this.error = 'User not authenticated.';
    }
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
    this.filteredMyBooks = [...this.myBooks];
    if (this.selectedCategory.toUpperCase() !== 'ALL') {
      this.filteredMyBooks = this.filteredMyBooks.filter(
        (book) => book.category === this.selectedCategory.toUpperCase()
      );
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredMyBooks = this.filteredMyBooks.filter((book) =>
        book.title?.toLowerCase().includes(searchLower)
      );
    }
  }
}
