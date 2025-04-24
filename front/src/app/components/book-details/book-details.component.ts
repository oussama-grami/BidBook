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
import { BookService, Book } from '../../services/book.service'; // Keep one import for BookService and Book type
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// IMPORTEZ LE TYPE 'Book' DIRECTEMENT DEPUIS L'EMPLACEMENT OÙ VOTRE SERVICE LE DÉFINIT
// Si Book est défini dans book.service.ts :
// import { Book } from '../../services/book.service'; // <-- This is already covered by the import above

// Si Comment est défini dans un fichier séparé utilisé par BookService, vous pourriez l'importer aussi
// import { Comment } from '../types/comment.types'; // Exemple

// L'interface Comment locale est correcte si elle correspond à la structure retournée pour les commentaires
interface Comment {
  id: number;
  content: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  // Removed duplicate properties
}

// Assurez-vous que l'interface UserRating correspond à ce que le backend retourne pour un ajout de note
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
  // Removed duplicate component configuration
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
  // Adjusted type to be more specific
  error: string | null = null;

  bookId: number | null = null;
  // TODO: Get actual user ID from authentication service
  currentUserId: number = 1; // Placeholder user ID
  math = Math;

  private querySubscription?: Subscription;
  private favoriteActionSubscription?: Subscription;
  // New subscription for rating submission
  private ratingSubmissionSubscription?: Subscription;


  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
  ) {
    // Keep parameter handling in constructor
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
    // Call a dedicated method to fetch book details
    this.fetchBookDetails();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
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

  // Method to fetch book details - extracted from ngOnInit
  private fetchBookDetails(): void {
     if (this.bookId === null || this.error) {
         // If bookId is null or there's already an error, don't fetch
         this.isLoadingBookDetails = false; // Ensure loading is off if fetch is skipped
         if (!this.error && this.bookId === null) {
             this.error = 'Book ID is missing or invalid.'; // Set generic error if none exists
         }
         console.warn('Fetch book details skipped due to missing ID or existing error.');
         return;
     }

     this.isLoadingBookDetails = true;
     this.error = null; // Clear previous errors before fetching

     // Unsubscribe previous fetch before starting a new one
     this.querySubscription?.unsubscribe();

     this.querySubscription = this.bookService.getBookDetails(this.bookId).subscribe({
       next: (book: Book | null | undefined) => { // Allow null/undefined response
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
           // Ensure owner is handled correctly if it might be null/undefined
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
             // If no bids, the starting point is the book's price
             this.lastBidPrice = this.price;
           }

           // Update rating and votes from fresh data
           if (book.ratings && book.ratings.length > 0) {
             const totalRate = book.ratings.reduce((sum, r) => sum + r.rate, 0);
             this.rating = totalRate / book.ratings.length;
             this.votes = book.ratings.length;
           } else {
             this.rating = 0;
             this.votes = 0;
           }

           // Update star states based on the new rating
           this.starStates = Array(5).fill('inactive').map((_, index) =>
             index < Math.round(this.rating) ? 'active' : 'inactive'
           );

           // Update comments from fresh data
           this.comments = book.comments || [];
           this.resetDisplayedComments();
           this.commentsLoaded = true;

           this.isLoadingBookDetails = false; // Loading finished
         } else {
           this.error = 'Book not found.';
           console.warn('Book details response was null or undefined.');
           this.isLoadingBookDetails = false; // Loading finished
         }
       },
       error: (err) => {
         console.error('Error fetching book details:', err);
         this.error = 'Failed to load book details. Please try again.';
         this.isLoadingBookDetails = false; // Loading finished
       },
     });
  }


  setUserRating(rating: number): void {
    this.userRating = rating;
     // Optional: Visually update stars immediately on hover/click
     this.starStates = Array(5).fill('inactive').map((_, index) =>
         index < this.userRating ? 'active' : 'inactive'
     );
  }

  submitUserRating(): void {
    if (this.userRating <= 0 || this.userRating > 5) {
      console.warn('Rating must be between 1 and 5.');
      this.error = 'Please select a rating between 1 and 5.';
      return;
    }

    if (this.bookId === null) {
      console.warn('Book ID is missing for rating submission.');
      this.error = 'Cannot submit rating: Book ID is missing.';
      return;
    }

    this.error = null; // Clear previous errors

    console.log(`Submitting rating ${this.userRating} for book ${this.bookId} by user ${this.currentUserId}`);

    // Unsubscribe from previous rating submission if any
    this.ratingSubmissionSubscription?.unsubscribe();

    // Call the service method to add the rating
    this.ratingSubmissionSubscription = this.bookService.addBookRating(this.currentUserId, this.bookId, this.userRating).subscribe({
      next: (response: UserRating) => { // Expecting UserRating type from service
        console.log('Rating submitted successfully:', response);
        // On success, refetch book details to update the average rating and votes
        this.fetchBookDetails();
        // Optional: Reset the user's selected rating after successful submission
        this.userRating = 0;
        // Reset the visual star states based on the *new* average from fetchBookDetails
        // Or clear them until fetch completes
         this.starStates = Array(5).fill('inactive');

      },
      error: (err: any) => {
        console.error('Error submitting rating:', err);
        this.error = 'Failed to submit rating. Please try again.';
        // Revert visual star state if there was an error
        this.starStates = Array(5).fill('inactive').map((_, index) =>
             index < Math.round(this.rating) ? 'active' : 'inactive'
         );
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

    // Optimistic update
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.likes++;
    } else {
      // Prevent likes from going below zero if there's an issue
      if (this.likes > 0) this.likes--;
    }

    // Unsubscribe from previous favorite action if any
    this.favoriteActionSubscription?.unsubscribe();

    if (!wasFavorite) {
      console.log(`Attempting to add favorite for book ${this.bookId} by user ${this.currentUserId}`);

      this.favoriteActionSubscription = this.bookService.addBookToFavorites(this.currentUserId, this.bookId).subscribe({
        next: (success) => { // Assuming service returns a boolean or similar success indicator
          if (success) {
            console.log('Favorite added successfully.');
             // fetch book details to get the updated favorites list and likes count from the source of truth
             this.fetchBookDetails();
          } else {
            console.warn('Add favorite mutation did not return success. Reverting optimistic update.');
            this.isFavorite = false;
             // Revert likes count - fetchDetails will correct it anyway
            if (this.likes > 0) this.likes--; // Revert only if it was incremented
            this.error = 'Failed to add to favorites.';
          }
        },
        error: (error: any) => {
          console.error('Error adding favorite:', error);
          // Revert optimistic update on error
          this.isFavorite = false;
          if (this.likes > 0) this.likes--; // Revert only if it was incremented
          this.error = 'Failed to add to favorites. Please try again.';
        }
      });

    } else {
      console.log(`Attempting to remove favorite for book ${this.bookId} by user ${this.currentUserId}`);

      this.favoriteActionSubscription = this.bookService.removeFavorite(this.currentUserId, this.bookId).subscribe({
        next: (success) => { // Assuming service returns a boolean or similar success indicator
          if (success) {
            console.log('Favorite removed successfully.');
             // fetch book details to get the updated favorites list and likes count from the source of truth
             this.fetchBookDetails();
          } else {
            console.warn('Remove favorite mutation did not return success. Reverting optimistic update.');
            this.isFavorite = true;
            this.likes++; // Revert only if it was decremented
            this.error = 'Failed to remove from favorites.';
          }
        },
        error: (error: any) => {
          console.error('Error removing favorite:', error);
          // Revert optimistic update on error
          this.isFavorite = true;
          this.likes++; // Revert only if it was decremented
          this.error = 'Failed to remove from favorites. Please try again.';
        }
      });
    }
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
           // Assurez-vous que la structure de réponse correspond à { data: { addCommentToBook: ... } }
        return response.data?.addCommentToBook;
      })
    )
    .subscribe({
      next: (newComment: Comment | null | undefined) => { // Explicitly type newComment
        // Vérifiez que newComment est bien l'objet commentaire complet avec user, createdAt, etc.
        // comme le backend est censé le retourner.
        if (newComment) {
          console.log('Comment added successfully:', newComment);
          // Correction de l'erreur "object is not extensible" si elle se produit
          // Crée un nouveau tableau immutable en ajoutant le nouveau commentaire au début
          this.comments = [newComment, ...this.comments];

          // Réinitialise les commentaires affichés pour inclure le nouveau commentaire
          this.resetDisplayedComments();
          this.userComment = ''; // Efface le champ de commentaire
        } else {
          console.error('Comment mutation returned no data or null.');
          this.error = 'Failed to add comment: Server returned no data.';
        }
      },
      error: (err: any) => {
        console.error('Error adding comment:', err);
        this.error = 'Failed to add comment. Please try again.';
      },
    });
  }

  loadMoreComments(): void {
    // Ajouter une vérification pour bookId ici aussi pour plus de robustesse
    if (this.bookId === null || this.isLoadingComments || !this.comments || this.displayedComments.length === this.comments.length) {
      console.log('Cannot load more comments, all displayed, loading, or book ID missing.');
      return;
    }

    const startIndex = this.displayedComments.length;
    const endIndex = Math.min(startIndex + this.commentsPerPage, this.comments.length);

    this.isLoadingComments = true;
    // Utiliser setTimeout pour simuler un chargement asynchrone, si c'est l'intention
    setTimeout(() => {
      const newComments = this.comments.slice(startIndex, endIndex);
      this.displayedComments = [...this.displayedComments, ...newComments];
      this.currentPage++;
      this.isLoadingComments = false;
      this.updateLoadMoreButtonVisibility();
      console.log(`Loaded more comments. Displayed: ${this.displayedComments.length}/${this.comments.length}`);
    }, 300); // Délai de 300ms
  }

  resetDisplayedComments(): void {
    // Ensure this.comments exists before slicing
    if (this.comments && this.comments.length > 0) {
      this.displayedComments = this.comments.slice(0, this.commentsPerPage);
      this.currentPage = 1;
      this.updateLoadMoreButtonVisibility();
      console.log(`Reset displayed comments. Showing ${this.displayedComments.length}/${this.comments.length}`);
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
      // Initialize userBidPrice with the last bid price for convenience
      this.userBidPrice = this.lastBidPrice;
      return;
    }

    if (this.bookId === null) {
      this.bidError = 'Book ID is missing.';
      console.warn('Bid validation failed:', this.bidError);
      return;
    }

    // Validate bid amount
    const minBid = this.lastBidPrice + 0.01; // Minimum increment, adjust as needed
    if (!this.userBidPrice || isNaN(this.userBidPrice) || this.userBidPrice < minBid) {
      this.bidError = `Please enter a valid bid amount greater than ${this.lastBidPrice.toFixed(2)}D.`;
      console.warn('Bid validation failed:', this.bidError);
      return;
    }

    this.bidError = '';
    console.log(`Attempting to submit bid of ${this.userBidPrice} for book ${this.bookId} by user ${this.currentUserId}`);

    // TODO: Implement backend call to submit the bid via BookService
    // Example service call (assuming a method like placeBid exists):
    /*
    this.bookService.placeBid(this.currentUserId, this.bookId, this.userBidPrice).subscribe({
       next: (bidResponse) => {
         console.log('Bid submitted successfully:', bidResponse);
         // On success, update lastBidPrice and hide input
         this.lastBidPrice = this.userBidPrice; // Update local state
         this.userBidPrice = 0; // Reset input
         this.showBidInput = false; // Hide input
         // Maybe fetch book details again to get the latest bids list etc.
         this.fetchBookDetails();
       },
       error: (err) => {
         console.error('Error submitting bid:', err);
         this.bidError = 'Failed to submit bid. Please try again.';
       }
    });
    */

    // Placeholder: Update state assuming success (remove this when backend call is implemented)
    console.log('Bid submitted (client-side only update). Remember to implement backend call.');
    this.lastBidPrice = this.userBidPrice; // Update local state optimistically
    this.userBidPrice = 0; // Reset input
    this.showBidInput = false; // Hide input

  }
}