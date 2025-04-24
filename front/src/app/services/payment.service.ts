import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';


export interface Book {
    id: number;
    title: string;
    price: number;
    imageUrl: string;
}

export interface Transaction{
    id: number;
    amount: number;
    book: Book;

}

@Injectable({
    providedIn: 'root',
  })
  export class PaymentService {
    private apiUrl = 'http://localhost:3000/stripe';
    private transactionSubject = new BehaviorSubject<Transaction | null>(null);

    transaction$ = this.transactionSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadTransaction();
    }

    private loadTransaction(): void {
        this.http.get<{transaction: Transaction}>(`${this.apiUrl}/1`)
            .subscribe({
                next: (response) => {
                    if (response && response.transaction) {
                        this.transactionSubject.next(response.transaction);
                    }
                },
                error: (error) => {
                    console.error('Error loading transaction:', error);
                    this.transactionSubject.next(null);
                }
            });
    }

    updateTransactionStatus(transactionId: number, status: 'succeeded' | 'failed'): Observable<Transaction> {
        return this.http.patch<Transaction>(`${this.apiUrl}/transaction/${transactionId}/status`, { status });
    }
}