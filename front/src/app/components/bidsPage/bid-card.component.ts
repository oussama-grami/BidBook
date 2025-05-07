import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bid } from '../../services/book.service';
import { RouterModule } from '@angular/router';
import { ImagePreloadDirective } from '../../shared/directives/image-preload.directive';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bid-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ImagePreloadDirective],
  template: `
    <div class="bid-card">
      <div class="book-info">
        <div class="book-image-container">
          <img
            [src]="bid.book.picture"
            alt="{{ bid.book.title }}"
            class="book-image"
            appImagePreload
            fallback="/images/image.png"
          />
          <div class="overlay">
                <span class="read-more" [routerLink]="['/books', bid.book.id]"
                >View Book</span
                >
          </div>
        </div>
        <h3 class="book-title">{{ bid.book.title }}</h3>
        <div class="bid-details">
          <p class="bid-amount">
            Your Bid: <strong>{{ bid.amount | currency }}</strong>
          </p>
          <p class="bid-date">
            Bid Date: {{ bid.createdAt | date: 'mediumDate' }}
          </p>
          <p
            class="bid-status"
            [ngClass]="'status-' + bid.bidStatus.toLowerCase()"
          >
            Status: {{ bid.bidStatus }}
          </p>
        </div>
      </div>
      <div class="bid-actions" *ngIf="bid.bidStatus === 'ACCEPTED'">
        <button class="pay-button" (click)="payNow()">Pay Now</button>
      </div>
    </div>
  `,
  styles: [
    `
      .bid-card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        width: 600px;
        height: auto; /* Adjust height to accommodate the button */
        margin: 10px auto;
      }

      .bid-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      }

      .book-info {
        padding: 15px;
        display: flex;
        gap: 15px;
        align-items: center;
      }

      .book-image-container {
        width: 100px;
        height: 100px;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }

      .book-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .status-pending {
        color: orange;
      }

      .status-accepted {
        color: green;
      }

      .status-rejected {
        color: red;
      }

      .book-image-container:hover .overlay {
        opacity: 1;
      }

      .read-more {
        color: white;
        font-size: 14px;
        font-weight: 600;
        padding: 8px 16px;
        border: 1px solid white;
        border-radius: 20px;
        text-decoration: none;
      }

      .book-title {
        font-size: 16px;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 5px;
      }

      .bid-details {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .bid-amount {
        font-size: 14px;
        color: #50719c;
      }

      .bid-date {
        font-size: 12px;
        color: #718096;
      }

      .bid-status {
        font-size: 13px;
        font-weight: bold;
      }

      .bid-actions {
        padding: 10px 15px;
        display: flex;
        justify-content: flex-end;
      }

      .pay-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      .pay-button:hover {
        background-color: #45a049;
      }

      @media (max-width: 640px) {
        .book-info {
          gap: 10px;
          padding: 10px;
        }

        .book-image-container {
          width: 80px;
          height: 80px;
        }

        .book-title {
          font-size: 14px;
          margin-bottom: 3px;
        }

        .bid-amount,
        .bid-date,
        .bid-status {
          font-size: 11px;
        }

        .read-more {
          font-size: 12px;
          padding: 6px 12px;
        }

        .pay-button {
          font-size: 12px;
          padding: 6px 12px;
        }
      }
    `,
  ],
})
export class BidCardComponent {
  @Input() bid!: Bid;
  constructor(private http: HttpClient) {} // Inject HttpClient

  payNow() {
    if (this.bid?.book?.id) {
      console.log(
        `Initiating payment for book ID: ${this.bid.book.id} with bid ID: ${this.bid.id} and amount: ${this.bid.amount}`
      );
      // Call the backend endpoint to create the transaction
      this.http
        .post<{ transaction: { id: number } }>(
          `http://localhost:3000/stripe/create-transaction-for-bid/${this.bid.id}`,
          {}
        )
        .subscribe({
          next: (response) => {
            if (response?.transaction?.id) {
              console.log('Transaction ID received:', response.transaction.id);
              window.location.href = `/payment/${response.transaction.id}`;
            } else {
              alert('Could not create transaction.');
            }
          },
          error: (error) => {
            alert('Failed to initiate payment.');
            console.error('Payment initiation error:', error);
          },
        });
    } else {
      alert('Book ID not found for this bid.');
      console.error('Book ID missing for bid:', this.bid);
    }
  }
}
