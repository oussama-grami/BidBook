import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, map, Observable, of, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Transaction {
  id: number;
  amount: number;
  bookid: number;
  title: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/stripe';
  private transactionSubject = new BehaviorSubject<Transaction | null>(null);

  transaction$ = this.transactionSubject.asObservable();

  constructor(private http: HttpClient) {
    //this.loadTransaction(); // Removed initial load
  }

  loadTransaction(transactionId: number): Observable<Transaction> {
    return this.http.get<{ transaction: Transaction }>(`${this.apiUrl}/${transactionId}`)
      .pipe(
        tap((response) => {
          if (response && response.transaction) {
            this.transactionSubject.next(response.transaction);
          }
        }),
        catchError((error) => {
          console.error('Error loading transaction:', error);
          this.transactionSubject.next(null);
          return throwError(error); // Re-throw the error
        }),
        map((response) => response.transaction) // Extract the transaction property
      );
  }

  updateTransactionStatus(
    transactionId: number,
    status: 'succeeded' | 'failed'
  ): Observable<Transaction> {
    return this.http.patch<Transaction>(
      `${this.apiUrl}/transaction/${transactionId}/status`,
      { status }
    );
  }
}
