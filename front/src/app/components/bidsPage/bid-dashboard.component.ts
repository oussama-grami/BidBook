import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidCardComponent } from './bid-card.component';
import { BidStatusListComponent } from './category-bar.component';
import { BidStatus } from '../../enums/status.enum';
import { Bid, BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-view-bids-page',
  standalone: true,
  imports: [CommonModule, BidCardComponent, BidStatusListComponent],
  template: `
    <main class="bids-container" [@fadeIn]>
      <h1 class="bids-title" [@slideInRight]>My Bids</h1>

      <app-bid-status-list
        [bidStatuses]="bidStatuses"
        [selectedStatus]="selectedBidStatus"
        (statusSelected)="onBidStatusChange($event)"
        (searchChanged)="onSearchChange($event)"
      ></app-bid-status-list>

      <div *ngIf="loading">Loading bids...</div>
      <div *ngIf="error">Error loading bids: {{ error }}</div>

      <section class="bids-section" *ngIf="!loading && !error && filteredBids.length > 0">
        <div class="bids-grid" [@bidsAnimation]>
          <app-bid-card *ngFor="let bid of filteredBids" [bid]="bid"></app-bid-card>
        </div>
      </section>

      <div *ngIf="!loading && !error && filteredBids.length === 0">
        <p class="no-bids">You haven't placed any bids yet.</p>
      </div>
    </main>
  `,
  styles: [/* ... styles ... */],
  animations: [],
  providers: [Apollo, HttpLink, BookService],
})
export class ViewBidsPageComponent implements OnInit, OnDestroy {
  bids: Bid[] = [];
  filteredBids: Bid[] = [];
  loading = true;
  error: any;
  private querySubscription?: Subscription;
  bidStatuses: (BidStatus)[] = [BidStatus.PENDING, BidStatus.ACCEPTED, BidStatus.REJECTED, BidStatus.ALL];
  selectedBidStatus: BidStatus | 'ALL' = 'ALL';
  searchTerm: string = '';

  constructor(
    private readonly bookService: BookService,
    private readonly ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.querySubscription = this.bookService.myBids().subscribe({
      next: (bids) => {
        this.bids = bids;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        console.error('Error fetching bids:', err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
  }

  onBidStatusChange(status: BidStatus | 'ALL'): void {
    this.selectedBidStatus = status;
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredBids = [...this.bids];

    if (this.selectedBidStatus !== 'ALL') {
      this.filteredBids = this.filteredBids.filter(
        (bid) => bid.bidStatus === this.selectedBidStatus
      );
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredBids = this.filteredBids.filter((bid) =>
        bid.book.title.toLowerCase().includes(searchLower)
      );
    }
  }
}
