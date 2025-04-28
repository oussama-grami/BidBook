import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Transaction {
    type: 'Bought' | 'Sold';
    direction: 'To' | 'From';
    user: string;
    amount: string;
    date: string;
}


@Injectable({
    providedIn: 'root',
})
export class HistoryService {


    private apiUrl = 'http://localhost:3000/stripe';
    private transactionSubject = new BehaviorSubject<Transaction[]>([]);
    private userId: number | null = null;
    // Subscribe to currentUser$ observable
    transactions$ = this.transactionSubject.asObservable();

    constructor(private http: HttpClient, private authService: AuthService) {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.userId = user.id;
                this.loadTransactions();
            }
        });
        
    }

    private loadTransactions(): void {
        this.http.get<{transactions: any[]}>(`${this.apiUrl}/allTransactions/${this.userId}`)
            .subscribe({
                next: (response) => {
                    if (response && response.transactions) {
                        console.log('found at least one transaction ! ');
                        const mappedTransactions: Transaction[] = response.transactions.map(t => {
                            const transactionData = t.transaction;
                            const isBuyer = this.userId === transactionData.buyerId;
    
                            const type: 'Bought' | 'Sold' = isBuyer ? 'Bought' : 'Sold';
                            const direction: 'From' | 'To' = type === 'Bought' ? 'From' : 'To';
                            const user = isBuyer ? transactionData.seller : transactionData.buyer;
                            const amount = transactionData.amount;
                            const date = transactionData.completionDate;
    
                            return { type, direction, user, amount, date };
                        });
    
                        this.transactionSubject.next(mappedTransactions);
                        console.log('Transactions loaded:', mappedTransactions);
                    }
                    else{
                        console.log('No transactions found for this user!');
                        this.transactionSubject.next([]); // Emit an empty array if no transactions are found
                    }
                },
                error: (error) => {
                    console.error('Error loading transactions:', error);
                    this.transactionSubject.next([]);
                }
            });
    }
    

}