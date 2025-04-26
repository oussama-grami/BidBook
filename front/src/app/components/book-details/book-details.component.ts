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
import { BookService, Book, Bid } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {UserIdService} from '../../services/userid.service';

interface Comment {
  id: number;
  content: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

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

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    CommonModule,
    BackArrowComponent,
    FormsModule,
    DatePipe,
  ],
  animations: [trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate(
        '0.5s ease-out',
        style({ opacity: 1, transform: 'translateY(0)' })
      ),
    ]),
  ]),
    trigger('scaleHeart', [
      transition('* => *', [
        animate('0.3s', style({ transform: 'scale(1.3)' })),
        animate('0.2s', style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('starRating', [
      state(
        'inactive',
        style({
          transform: 'scale(1)',
          opacity: '0.5',
        })
      ),
      state(
        'active',
        style({
          transform: 'scale(1.2)',
          opacity: '1',
        })
      ),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out')),
    ]),
    trigger('backButton', [
      state(
        'normal',
        style({
          transform: 'scale(1) rotate(0deg)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'scale(1.1) rotate(-10deg)',
        })
      ),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),],
  providers: [BookService],
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

  hasBid: boolean = false;
  hasRated: boolean = false;
  isLoadingBookDetails: boolean = true;
  isSubmittingBid: boolean = false;
  error: any = null;

  bookId: number | null = null;
  currentUserId: number | null = null;
  math = Math;
  private querySubscription?: Subscription;
  private bidSubscription?: Subscription;
  private favoriteActionSubscription?: Subscription;
  private ratingSubmissionSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private userIdService: UserIdService
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
    this.currentUserId = this.userIdService.getUserId();
    if (this.bookId !== null && !this.error) {
      this.loadBookDetailsAndBids(this.bookId);
    } else {
      this.isLoadingBookDetails = false;
      if (!this.error) {
        this.error = 'Book ID is missing or invalid.';
      }
      console.error('ngOnInit aborted due to missing or invalid book ID.');
    }
  }

  ngOnDestroy(): void {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
    if (this.favoriteActionSubscription) {
      this.favoriteActionSubscription.unsubscribe();
    }
    if (this.ratingSubmissionSubscription) {
      this.ratingSubmissionSubscription.unsubscribe();
    }
  }
  loadBookDetailsAndBids(bookId: number): void {
    this.isLoadingBookDetails = true;
    this.error = null;

    this.querySubscription = this.bookService.getBookDetails(bookId).subscribe({
      next: (book: Book) => {
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
          this.comments = book.comments || [];
          this.resetDisplayedComments();
          this.commentsLoaded = true;

          // Determine the initial last bid price
          if (book.bids && book.bids.length > 0) {
            const sortedBids = [...book.bids].sort((a, b) => b.amount - a.amount);
            this.lastBidPrice = sortedBids[0].amount;
            this.hasBid = book.bids.some(bid => bid.bidder?.id === this.currentUserId);
          } else {
            this.lastBidPrice = this.price;
            this.hasBid = false;
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
        } else {
          this.error = 'Book not found.';
          console.warn('Book details response was null or undefined.');
        }
        this.isLoadingBookDetails = false;
      },
      error: (err) => {
        console.error('Error fetching book details:', err);
        this.error = 'Failed to load book details. Please try again.';
        this.isLoadingBookDetails = false;
      },
    });
  }




  private fetchBookDetails(): void {
    if (this.bookId === null || this.error) {
      this.isLoadingBookDetails = false;
      if (!this.error && this.bookId === null) {
        this.error = 'Book ID is missing or invalid.';
      }
      return;
    }

    this.isLoadingBookDetails = true;
    this.error = null;

    this.querySubscription?.unsubscribe();

    this.querySubscription = this.bookService.getBookDetails(this.bookId).subscribe({
      next: (book: Book | null | undefined) => {
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
          this.owner = book.owner ? {
            id: book.owner.id,
            firstName: book.owner.firstName,
            lastName: book.owner.lastName,
            imageUrl: book.owner.imageUrl
          } : undefined;

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
            const userExistingRating = book.ratings.find(r => r.user?.id === this.currentUserId);
            this.userRating = userExistingRating ? userExistingRating.rate : 0;
          } else {
            this.rating = 0;
            this.votes = 0;
            this.userRating = 0;
          }

          this.starStates = Array(5).fill('inactive').map((_, index) =>
            index < this.userRating ? 'active' : 'inactive'
          );

          this.comments = book.comments || [];
          this.resetDisplayedComments();
          this.commentsLoaded = true;

          this.isLoadingBookDetails = false;
        } else {
          this.error = 'Book not found.';
          this.isLoadingBookDetails = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load book details. Please try again.';
        this.isLoadingBookDetails = false;
      },
    });
  }

  setUserRating(rating: number): void {
    this.userRating = rating;
    this.starStates = Array(5).fill('inactive').map((_, index) =>
      index < this.userRating ? 'active' : 'inactive'
    );
  }

  submitUserRating(): void {
    if (this.userRating <= 0 || this.userRating > 5) {
      this.error = 'Please select a rating between 1 and 5.';
      return;
    }

    if (this.bookId === null || this.currentUserId === null) {
      this.error = 'Cannot submit rating: Book or User ID is missing.';
      return;
    }

    this.error = null;
    this.ratingSubmissionSubscription?.unsubscribe();

    const ratingAction = this.hasRated
      ? this.bookService.updateBookRate(this.bookId, this.userRating)
      : this.bookService.addBookRating(this.bookId, this.userRating);

    this.ratingSubmissionSubscription = ratingAction.subscribe({
      next: (response: UserRating) => {
        this.fetchBookDetails();
        this.hasRated = true;
      },
      error: (err: any) => {
        this.error = 'Failed to submit/update rating. Please try again.';
        console.error('Error submitting/updating rating:', err);
      }
    });
  }

  toggleFavorite(): void {
    if (this.bookId === null) {
      this.error = 'Cannot favorite/unfavorite, book ID is missing.';
      return;
    }

    this.error = null;
    const wasFavorite = this.isFavorite;

    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.likes++;
    } else {
      if (this.likes > 0) this.likes--;
    }

    this.favoriteActionSubscription?.unsubscribe();

    if (!wasFavorite) {
      this.favoriteActionSubscription = this.bookService.addBookToFavorites(this.bookId).subscribe({
        next: (success) => {
          if (success) {
            this.fetchBookDetails();
          } else {
            this.isFavorite = false;
            if (this.likes > 0) this.likes--;
            this.error = 'Failed to add to favorites.';
          }
        },
        error: (error: any) => {
          this.isFavorite = true;
          if (this.likes > 0) this.likes--;
          this.error = 'Failed to add to favorites. Please try again.';
        }
      });
    } else {
      this.favoriteActionSubscription = this.bookService.removeFavorite(this.bookId).subscribe({
        next: (success) => {
          if (success) {
            this.fetchBookDetails();
          } else {
            this.isFavorite = true;
            this.likes++;
            this.error = 'Failed to remove from favorites.';
          }
        },
        error: (error: any) => {
          this.isFavorite = true;
          this.likes++;
          this.error = 'Failed to remove from favorites. Please try again.';
        }
      });
    }
  }

  submitComment(): void {
    if (!this.userComment.trim() || this.bookId === null) {
      this.error = 'Comment cannot be empty.';
      return;
    }
    this.error = null;

    const commentContent = this.userComment.trim();

    this.bookService.addCommentToBook(this.bookId, commentContent).pipe(

      map(response => {
        return response.data?.addCommentToBook;
      })
    )
      .subscribe({
        next: (newComment: Comment | null | undefined) => {
          if (newComment) {
            this.comments = [newComment, ...this.comments];
            this.resetDisplayedComments();
            this.userComment = '';
          } else {
            this.error = 'Failed to add comment: Server returned no data.';
          }
        },
        error: (err: any) => {
          this.error = 'Failed to add comment. Please try again.';
        },
      });
  }

  loadMoreComments(): void {
    if (this.bookId === null || this.isLoadingComments || !this.comments || this.displayedComments.length === this.comments.length) {
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
    }, 300);
  }

  resetDisplayedComments(): void {
    if (this.comments && this.comments.length > 0) {
      this.displayedComments = this.comments.slice(0, this.commentsPerPage);
      this.currentPage = 1;
      this.updateLoadMoreButtonVisibility();
      console.log(`Reset displayed comments. Showing <span class="math-inline">\{this\.displayedComments\.length\}/</span>{this.comments.length}`);
    } else {
      this.displayedComments = [];
      this.currentPage = 1;
      this.showLoadMoreButton = false;
      console.log('No comments to display after reset.');
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

    const minBid = this.lastBidPrice + 0.01;
    if (!this.userBidPrice || isNaN(this.userBidPrice) || this.userBidPrice < minBid) {
      this.bidError = `Please enter a valid bid amount greater than ${this.lastBidPrice.toFixed(2)}D.`;
      console.warn('Bid validation failed:', this.bidError);
      return;
    }

    this.bidError = '';
    this.isSubmittingBid = true;
    console.log(`Attempting to submit bid of ${this.userBidPrice} for book ${this.bookId} by user ${this.currentUserId}`);
    const bidAmount = this.userBidPrice;
    const bookId = this.bookId;
    const userId = this.currentUserId;

    if (this.hasBid) {

      this.bidSubscription = this.bookService.updateBid( bookId, bidAmount).subscribe({
        next: (updatedBid) => {
          if (updatedBid) {
            console.log('Bid updated successfully:', updatedBid);
            this.lastBidPrice = updatedBid.amount;
            this.userBidPrice = 0;
            this.showBidInput = false;
            this.isSubmittingBid = false;
            this.hasBid = true;
          } else {
            this.bidError = 'Failed to update bid.';
            this.isSubmittingBid = false;
          }
        },
        error: (error) => {
          console.error('Error updating bid:', error);
          this.bidError = error.message || 'Failed to update bid. Please try again.';
          this.isSubmittingBid = false;
        },
      });
    } else {
      this.bidSubscription = this.bookService.createBid(bookId, bidAmount).subscribe({
        next: (newBid) => {
          if (newBid) {
            console.log('Bid created successfully:', newBid);
            this.lastBidPrice = newBid.amount;
            this.userBidPrice = 0;
            this.showBidInput = false;
            this.isSubmittingBid = false;
            this.hasBid = true;
          } else {
            this.bidError = 'Failed to create bid.';
            this.isSubmittingBid = false;
          }
        },
        error: (error) => {
          console.error('Error creating bid:', error);
          this.bidError = error.message || 'Failed to create bid. Please try again.';
          this.isSubmittingBid = false;
        },
      });
    }
  }
}

