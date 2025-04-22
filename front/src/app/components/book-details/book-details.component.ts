import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForOf, NgIf, DatePipe, CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BackArrowComponent } from '../navigation/back-arrow.component';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    CommonModule,
    BackArrowComponent,
    FormsModule,
    DatePipe,
  ],
  styleUrls: ['./book-details.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('scaleHeart', [
      transition('* => *', [
        animate('0.3s', style({ transform: 'scale(1.3)' })),
        animate('0.2s', style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('starRating', [
      state('inactive', style({ transform: 'scale(1)', opacity: '0.5' })),
      state('active', style({ transform: 'scale(1.2)', opacity: '1' })),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out')),
    ]),
    trigger('backButton', [
      state('normal', style({ transform: 'scale(1) rotate(0deg)' })),
      state('hovered', style({ transform: 'scale(1.1) rotate(-10deg)' })),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),
  ],
  providers: [
    Apollo,
    HttpLink,
    BookService,
  ],
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  title: string = '';
  author: string = '';
  genre: string = '';
  rating: number = 0;
  votes: number = 0;
  pages: number = 0;
  coverImage: string = '';
  likes: number = 0;
  description: string = '';
  price: number = 0;
  lastBidPrice: number = 0;
  age: number | undefined;
  edition: string | undefined;
  language: string | undefined;
  editor: string | undefined;
  owner: { id: number; firstName: string; lastName: string; imageUrl: string } | undefined;

  userRating: number = 0;
  isFavorite: boolean = false;
  starStates: string[] = Array(5).fill('inactive');

  userComment: string = '';
  comments: { id: number; content: string; createdAt: string; user: { id: number; firstName: string; lastName: string; imageUrl: string }; }[] = [];
  displayedComments: any[] = [];
  commentsPerPage: number = 3;
  currentPage: number = 1;
  isLoadingComments: boolean = false;
  showLoadMoreButton: boolean = false;
  commentsLoaded: boolean = false;

  userBidPrice: number = 0;
  bidError: string = '';
  showBidInput: boolean = false;

  isLoadingBookDetails: boolean = true;
  error: any = null;

  bookId: number | null = null;
  currentUserId: number = 1;
  math = Math;

  private querySubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id && !isNaN(id)) {
        this.bookId = id;
      } else {
        this.isLoadingBookDetails = false;
        this.error = 'Invalid book ID.';
      }
    });
  }

  ngOnInit(): void {
    if (this.bookId !== null && !this.error) {
      this.isLoadingBookDetails = true;
      this.error = null;
      this.querySubscription = this.bookService.getBookDetails(Number(this.bookId)).subscribe({
        next: (book) => {
          if (book) {
            this.title = book.title || '';
            this.author = book.author || '';
            this.genre = book.category || '';
            this.coverImage = book.picture || '/images/placeholder.png';
            this.price = book.price || 0;
            this.pages = book.totalPages || 0;
            this.age = book.age;
            this.edition = 'ed';
            this.language = book.language || undefined;
            this.editor = book.editor || undefined;
            this.owner = book.owner;

            this.likes = book.favorites?.length || 0;
            if (book.bids && book.bids.length > 0) {
              const highestBid = Math.max(...book.bids.map(bid => bid.amount));
              this.lastBidPrice = highestBid;
            } else {
              this.lastBidPrice = this.price;
            }
            if (book.rating && book.rating.length > 0) {
              const totalRate = book.rating.reduce((sum, r) => sum + r.rate, 0);
              this.rating = totalRate / book.rating.length;
              this.votes = book.rating.length;
            } else {
              this.rating = 0;
              this.votes = 0;
            }
            this.starStates = Array(5).fill('inactive').map((_, index) =>
              index < Math.round(this.rating) ? 'active' : 'inactive'
            );

            const currentUserId = this.currentUserId;
            this.isFavorite = book.favorites?.some(fav => fav.user?.id === currentUserId) || false;
          } else {
            this.error = 'Book not found.';
          }
          this.isLoadingBookDetails = false;
        },
        error: (err) => {
          this.error = 'Failed to load book details.';
          this.isLoadingBookDetails = false;
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
  }

  setUserRating(rating: number): void {
    this.userRating = rating;
  }

  submitUserRating(): void {
    if (this.userRating > 0 && this.bookId !== null) {
      // Service Call
    }
  }

  toggleFavorite(): void {
    if (this.bookId === null) return;
    this.isFavorite = !this.isFavorite;
  }

  submitComment(): void {
    if (!this.userComment.trim() || this.bookId === null) return;
    const newComment = {
      id: Date.now(),
      user: {
        id: this.currentUserId,
        firstName: 'Current',
        lastName: 'User',
        imageUrl: '/images/person.png'
      },
      content: this.userComment.trim(),
      createdAt: new Date().toISOString(),
    };
    this.comments.unshift(newComment);
    this.resetDisplayedComments();
    this.userComment = '';
  }

  loadMoreComments(): void {
    if (this.isLoadingComments || !this.comments) return;
    const startIndex = this.displayedComments.length;
    const endIndex = Math.min(startIndex + this.commentsPerPage, this.comments.length);
    if (startIndex < this.comments.length) {
      this.isLoadingComments = true;
      setTimeout(() => {
        const newComments = this.comments.slice(startIndex, endIndex);
        this.displayedComments = [...this.displayedComments, ...newComments];
        this.currentPage++;
        this.isLoadingComments = false;
        this.updateLoadMoreButtonVisibility();
      }, 300);
    }
  }

  resetDisplayedComments(): void {
    if (this.comments) {
      this.displayedComments = this.comments.slice(0, this.commentsPerPage);
      this.currentPage = 1;
      this.updateLoadMoreButtonVisibility();
    } else {
      this.displayedComments = [];
      this.currentPage = 1;
      this.showLoadMoreButton = false;
    }
  }

  updateLoadMoreButtonVisibility(): void {
    this.showLoadMoreButton = (this.comments?.length || 0) > this.displayedComments.length;
  }

  submitBid(): void {
    if (!this.showBidInput) {
      this.showBidInput = true;
      return;
    }
    if (!this.userBidPrice || this.bookId === null || this.userBidPrice <= this.lastBidPrice) {
      this.bidError = !this.bookId ? 'Book ID is missing.' : `Your bid must be higher than the current bid of ${this.lastBidPrice}D`;
      return;
    }
    this.bidError = '';
    this.lastBidPrice = this.userBidPrice;
    this.userBidPrice = 0;
    this.showBidInput = false;
  }
}
