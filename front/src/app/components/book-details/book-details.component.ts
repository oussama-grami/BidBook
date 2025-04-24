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
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

interface Comment {
  id: number;
  content: string;
  user?: {
    firstName: string;
    lastName: string; 
  };
  createdAt: string;
}

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
  comments: Comment[] = [];
  displayedComments: Comment[] = [];
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
    private bookService: BookService,
  ) {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (!isNaN(id)) {
        this.bookId = id;
      } else {
        this.isLoadingBookDetails = false;
        this.error = 'Invalid book ID.';
        console.error('Invalid book ID in route params:', params['id']);
      }
    });
  }

  ngOnInit(): void {
    if (this.bookId !== null && !this.error) {
      this.isLoadingBookDetails = true;
      this.error = null;

      this.querySubscription = this.bookService.getBookDetails(this.bookId).subscribe({
        next: (book) => {
          if (book) {
            this.title = book.title || '';
            this.author = book.author || '';
            this.genre = (book.category as any)?.name || book.category?.toString() || '';
            this.coverImage = book.picture || '/images/placeholder.png';
            this.price = book.price || 0;
            this.pages = book.totalPages || 0;
            this.age = book.age;
            this.edition = book.edition?.toString() || undefined;
            this.language = book.language?.toString() || undefined;
            this.editor = book.editor || undefined;
            this.owner = book.owner;

            this.likes = book.favorites?.length || 0;
            this.isFavorite = book.favorites?.some(fav => fav.user?.id === this.currentUserId) || false;

            if (book.bids && book.bids.length > 0) {
              const sortedBids = [...book.bids].sort((a, b) => b.amount - a.amount);
              this.lastBidPrice = sortedBids[0].amount;
            } else {
              this.lastBidPrice = this.price;
            }

            if (book.ratings && book.ratings.length > 0) {
              const totalRate = book.ratings.reduce((sum, r) => sum + r.rate, 0);
              this.rating = totalRate / book.ratings.length;
              this.votes = book.ratings.length;
            } else {
              this.rating = 0;
              this.votes = 0;
            }

            this.starStates = Array(5).fill('inactive').map((_, index) =>
              index < Math.round(this.rating) ? 'active' : 'inactive'
            );

            this.comments = book.comments || [];
            this.resetDisplayedComments();
            this.commentsLoaded = true;
          } else {
            this.error = 'Book not found.';
            console.warn('Book details response was null or undefined.');
          }
          this.isLoadingBookDetails = false;
        },
        error: (err) => {
          console.error('Error fetching book details:', err);
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
      console.log(`Submitting rating ${this.userRating} for book ${this.bookId} by user ${this.currentUserId}`);
    } else {
      console.warn('Rating not set or book ID is missing.');
    }
  }

  toggleFavorite(): void {
    if (this.bookId === null) {
      console.warn('Cannot toggle favorite, book ID is missing.');
      return;
    }
    this.isFavorite = !this.isFavorite;
    console.log(`${this.isFavorite ? 'Adding' : 'Removing'} favorite for book ${this.bookId} by user ${this.currentUserId}`);
  }

  submitComment(): void {
    if (!this.userComment.trim() || this.bookId === null) {
      console.warn('Comment is empty or book ID is missing.');
      this.error = 'Comment cannot be empty.';
      return;
    }
    this.error = null;

    const commentContent = this.userComment.trim();
    console.log(`Attempting to submit comment for book ${this.bookId} by user ${this.currentUserId}: "${commentContent}"`);

    this.bookService.addCommentToBook(this.bookId, this.currentUserId, commentContent).pipe(
      map(response => {
        return response.data?.addCommentToBook;
      })
    )
    .subscribe({
      next: (newComment) => {
        if (newComment) {
          console.log('Comment added successfully:', newComment);
          this.comments = [newComment, ...this.comments];
          this.resetDisplayedComments();
          this.userComment = '';
        } else {
          console.error('Comment mutation returned no data.');
          this.error = 'Failed to add comment: Server returned no data.';
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.error = 'Failed to add comment. Please try again.';
      },
    });
  }

  loadMoreComments(): void {
    if (this.isLoadingComments || !this.comments || this.displayedComments.length === this.comments.length) {
      console.log('Cannot load more comments or all comments are displayed.');
      return;
    }

    const startIndex = this.displayedComments.length;
    const endIndex = Math.min(startIndex + this.commentsPerPage, this.comments.length);

    this.isLoadingComments = true;
    setTimeout(() => {
      const newComments = this.comments.slice(startIndex, endIndex);
      this.displayedComments = [...this.displayedComments, ...newComments];
      this.currentPage++;
      this.isLoadingComments = false;
      this.updateLoadMoreButtonVisibility();
      console.log(`Loaded more comments. Displayed: ${this.displayedComments.length}/${this.comments.length}`);
    }, 300);
  }

  resetDisplayedComments(): void {
    if (this.comments) {
      this.displayedComments = this.comments.slice(0, this.commentsPerPage);
      this.currentPage = 1;
      this.updateLoadMoreButtonVisibility();
      console.log(`Reset displayed comments. Showing ${this.displayedComments.length}/${this.comments.length}`);
    } else {
      this.displayedComments = [];
      this.currentPage = 1;
      this.showLoadMoreButton = false;
      console.log('No comments to display.');
    }
  }

  updateLoadMoreButtonVisibility(): void {
    this.showLoadMoreButton = (this.comments?.length || 0) > this.displayedComments.length;
  }

  submitBid(): void {
    if (!this.showBidInput) {
      this.showBidInput = true;
      this.bidError = '';
      return;
    }

    if (this.bookId === null) {
      this.bidError = 'Book ID is missing.';
      console.warn('Bid validation failed:', this.bidError);
      return;
    }
    if (!this.userBidPrice || isNaN(this.userBidPrice) || this.userBidPrice <= 0) {
      this.bidError = 'Please enter a valid bid amount greater than 0.';
      console.warn('Bid validation failed:', this.bidError);
      return;
    }
    if (this.userBidPrice <= this.lastBidPrice) {
      this.bidError = `Your bid must be higher than the current bid of ${this.lastBidPrice.toFixed(2)}D`;
      console.warn('Bid validation failed:', this.bidError);
      return;
    }

    this.bidError = '';
    console.log(`Attempting to submit bid of ${this.userBidPrice} for book ${this.bookId} by user ${this.currentUserId}`);

    this.lastBidPrice = this.userBidPrice;
    this.userBidPrice = 0;
    this.showBidInput = false;
    console.log('Bid submitted (client-side only update).');
  }
}