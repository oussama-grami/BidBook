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

// IMPORTEZ LE TYPE 'Book' DIRECTEMENT DEPUIS L'EMPLACEMENT OÙ VOTRE SERVICE LE DÉFINIT
// Si Book est défini dans book.service.ts :
import { Book } from '../../services/book.service'; // <-- AJOUTEZ CET IMPORT

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
  // Assurez-vous que ce tableau est du type Comment[]
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

      // TypeScript attend un Book du service. En important le type Book,
      // il sait que book.author est string | undefined.
      this.querySubscription = this.bookService.getBookDetails(this.bookId).subscribe({
        // Typage explicite ici peut aider à la clarté
        next: (book: Book) => { // <-- Utilisation du type Book importé
          if (book) {
            this.title = book.title || '';
            this.author = book.author || ''; // Ceci gère correctement string | undefined
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
            // Assurez-vous que book.favorites et book.favorites[...].user existent avant d'y accéder
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

             // Assurez-vous que book.comments est bien un tableau du type Comment[]
            this.comments = book.comments || []; // Si book.comments est undefined, utilise []
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
          this.error = 'Failed to load book details. Please try again.';
          this.isLoadingBookDetails = false;
        },
      });
    } else {
         // Gérer le cas où bookId est null au démarrage
         this.isLoadingBookDetails = false;
         if (!this.error) { // Si l'erreur n'a pas été définie par l'invalid ID
             this.error = 'Book ID is missing or invalid.';
         }
         console.error('ngOnInit aborted due to missing or invalid book ID.');
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
      // TODO: Call service to submit rating
    } else {
      console.warn('Rating not set or book ID is missing.');
    }
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
    this.likes--;
  }

  if (!wasFavorite) {
    console.log(`Attempting to add favorite for book ${this.bookId} by user ${this.currentUserId}`);

    

     this.bookService.addBookToFavorites(this.currentUserId, this.bookId).subscribe({
      next: (response) => {
        console.log('Favorite added successfully', response);
      },
      error: (error) => {
        console.error('Error adding favorite:', error);
        this.isFavorite = false;
        this.likes--;
        this.error = 'Failed to add to favorites. Please try again.';
      }
    });

  } else {
    this.isFavorite = true;
    this.likes++;
    this.error = 'Remove favorite functionality is currently not available.';
  }
}




  submitComment(): void {
    if (!this.userComment.trim() || this.bookId === null) {
      console.warn('Comment is empty or book ID is missing.');
      this.error = 'Comment cannot be empty.'; // Affichez cette erreur à l'utilisateur dans le template
      return;
    }
    this.error = null; // Clear previous errors

    const commentContent = this.userComment.trim();
    console.log(`Attempting to submit comment for book ${this.bookId} by user ${this.currentUserId}: "${commentContent}"`);

    this.bookService.addCommentToBook(this.bookId, this.currentUserId, commentContent).pipe(
      map(response => {
          // Assurez-vous que la structure de réponse correspond à { data: { addCommentToBook: ... } }
        return response.data?.addCommentToBook;
      })
    )
    .subscribe({
      next: (newComment) => {
          // Vérifiez que newComment est bien l'objet commentaire complet avec user, createdAt, etc.
          // comme le backend est censé le retourner.
        if (newComment) {
          console.log('Comment added successfully:', newComment);
          // Correction de l'erreur "object is not extensible"
          this.comments = [newComment, ...this.comments]; // Crée un nouveau tableau immutable

          this.resetDisplayedComments(); // Met à jour les commentaires affichés
          this.userComment = ''; // Efface le champ
        } else {
          console.error('Comment mutation returned no data.');
          this.error = 'Failed to add comment: Server returned no data.'; // Affichez à l'utilisateur
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.error = 'Failed to add comment. Please try again.'; // Affichez à l'utilisateur
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
    if (this.comments) {
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
      return;
    }

    if (this.bookId === null) {
      this.bidError = 'Book ID is missing.'; // Affichez à l'utilisateur
      console.warn('Bid validation failed:', this.bidError);
      return;
    }
    // Utilisez `this.lastBidPrice` pour valider, pas `this.price` si un bid existe
    const minBid = this.lastBidPrice + 1;
    if (!this.userBidPrice || isNaN(this.userBidPrice) || this.userBidPrice < minBid) {
      this.bidError = `Please enter a valid bid amount greater than ${this.lastBidPrice.toFixed(2)}D.`; // Affichez à l'utilisateur
      console.warn('Bid validation failed:', this.bidError);
      return;
    }

    this.bidError = ''; // Efface l'erreur
    console.log(`Attempting to submit bid of ${this.userBidPrice} for book ${this.bookId} by user ${this.currentUserId}`);

    // TODO: Appeler le service pour soumettre l'enchère au backend
    // Une fois le succès confirmé par le backend :
    this.lastBidPrice = this.userBidPrice; // Mettre à jour le prix localement
    this.userBidPrice = 0; // Réinitialiser l'input
    this.showBidInput = false; // Cacher l'input

    console.log('Bid submitted (client-side only update). Remember to implement backend call).');
  }
}