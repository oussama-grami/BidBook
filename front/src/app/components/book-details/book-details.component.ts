import { Component, Input } from '@angular/core';
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

interface Comment {
  id: number;
  userImage: string;
  userName: string;
  text: string;
  date: Date;
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
    ]),
  ],
})
export class BookDetailsComponent {
  @Input() title: string = 'hello';
  @Input() author: string = 'Mohamed Aziz';
  @Input() genre: string = 'Comedy';
  @Input() rating: number = 4;
  @Input() votes: number = 5200;
  @Input() pages: number = 145;
  @Input() coverImage: string = '/images/Book1.png';
  @Input() likes: number = 128; // Added likes property
  @Input() description: string =
    'This is a description of the book. It provides an overview of the content and themes covered in the book. The book is a thrilling adventure that takes the reader on a journey through time and space, exploring the depths of human emotion and experience. It is a must-read for anyone who loves a good story.';
  userRating: number = 0;
  isFavorite: boolean = false;
  starStates: string[] = Array(5).fill('inactive');

  // Properties for comments and bidding
  userComment: string = '';
  comments: Comment[] = [];
  displayedComments: Comment[] = [];
  commentsPerPage: number = 3;
  currentPage: number = 1;
  isLoadingComments: boolean = false;
  showLoadMoreButton: boolean = false;
  commentsLoaded: boolean = false; // Track if comments have been loaded
  lastBidPrice: number = 25; // Starting bid price in dinars
  userBidPrice: number = 0;
  bidError: string = '';
  showBidInput: boolean = false; // New property to track bid input visibility

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      const bookId = params['id'];
      console.log('Book Id from route:', bookId);
      // Comments are not loaded initially, user must click to load them
    });
  }

  setUserRating(rating: number): void {
    this.userRating = rating;
    this.starStates = this.starStates.map((_, index) =>
      index < rating ? 'active' : 'inactive'
    );
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  // Comment methods
  submitComment(): void {
    if (!this.userComment.trim()) return;

    // If this is the first comment and comments haven't been loaded yet
    if (!this.commentsLoaded) {
      this.commentsLoaded = true;
    }

    const newComment: Comment = {
      id: this.comments.length + 1,
      userImage: '/images/person.png', // Default user image
      userName: 'Current User', // This would come from auth service in real app
      text: this.userComment,
      date: new Date(),
    };

    this.comments.unshift(newComment);
    this.resetDisplayedComments();
    this.userComment = '';
  }

  // New method to fetch comments when user requests them
  fetchComments(): void {
    // Don't fetch if already loading or already loaded
    if (this.isLoadingComments) return;

    this.isLoadingComments = true;

    // Simulate fetching comments from an API
    setTimeout(() => {
      this.comments = [
        {
          id: 3,
          userImage: '/images/person.png',
          userName: 'Jane Smith',
          text: 'This book changed my perspective on so many things! Highly recommend.',
          date: new Date(2025, 3, 10),
        },
        {
          id: 2,
          userImage: '/images/person.png',
          userName: 'John Doe',
          text: 'Great read! I loved the character development.',
          date: new Date(2025, 3, 5),
        },
        {
          id: 1,
          userImage: '/images/person.png',
          userName: 'Mark Johnson',
          text: 'The plot was intriguing but the ending was a bit rushed.',
          date: new Date(2025, 2, 28),
        },
        // Add more mock comments to demonstrate pagination
        {
          id: 4,
          userImage: '/images/person.png',
          userName: 'Alice Williams',
          text: "I couldn't put it down! Read it in one sitting.",
          date: new Date(2025, 2, 20),
        },
        {
          id: 5,
          userImage: '/images/person.png',
          userName: 'Robert Brown',
          text: 'The author really knows how to create compelling characters.',
          date: new Date(2025, 2, 15),
        },
      ];

      this.resetDisplayedComments();
      this.isLoadingComments = false;
      this.commentsLoaded = true;
      this.updateLoadMoreButtonVisibility();
    }, 1000);
  }

  // This method is kept for backward compatibility but isn't called on initialization
  loadInitialComments(): void {
    this.fetchComments();
  }

  loadMoreComments(): void {
    if (this.isLoadingComments) return;

    this.isLoadingComments = true;

    // Simulate API call with delay
    setTimeout(() => {
      const startIndex = this.displayedComments.length;
      const endIndex = Math.min(
        startIndex + this.commentsPerPage,
        this.comments.length
      );

      if (startIndex < this.comments.length) {
        const newComments = this.comments.slice(startIndex, endIndex);
        this.displayedComments = [...this.displayedComments, ...newComments];
        this.currentPage++;
      }

      this.isLoadingComments = false;
      this.updateLoadMoreButtonVisibility();
    }, 800);
  }

  resetDisplayedComments(): void {
    this.displayedComments = this.comments.slice(0, this.commentsPerPage);
    this.currentPage = 1;
    this.updateLoadMoreButtonVisibility();
  }

  updateLoadMoreButtonVisibility(): void {
    this.showLoadMoreButton =
      this.displayedComments.length < this.comments.length;
  }

  // Method for bidding
  submitBid(): void {
    // If bid input isn't shown yet, just show it
    if (!this.showBidInput) {
      this.showBidInput = true;
      return;
    }

    // Otherwise, process the bid submission
    if (!this.userBidPrice || this.userBidPrice <= this.lastBidPrice) {
      this.bidError = `Your bid must be higher than the current bid of ${this.lastBidPrice}D`;
      return;
    }

    this.bidError = '';
    this.lastBidPrice = this.userBidPrice;
    this.userBidPrice = 0;
    this.showBidInput = false; // Hide the bid form after successful submission

    // In a real app, you would save this bid to your backend
    console.log(`New bid placed: ${this.lastBidPrice}D`);
  }
}
