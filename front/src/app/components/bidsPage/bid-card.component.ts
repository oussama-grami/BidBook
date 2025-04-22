import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Bid, BookService} from '../../services/book.service';
import { RouterModule } from '@angular/router';
import { ImagePreloadDirective } from '../../shared/directives/image-preload.directive';

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
          <p class="bid-status" [ngClass]="'status-' + bid.bidStatus.toLowerCase()">
            Status: {{ bid.bidStatus }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .bid-card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
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

      .status-pending {
        color: orange;
      }

      .status-accepted {
        color: green;
      }

      .status-rejected {
        color: red;
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
      }
    `,
  ],
})
export class BidCardComponent {
  @Input() bid!: Bid;
}
