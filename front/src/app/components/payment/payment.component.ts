import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ImageModule } from 'primeng/image';
import {
  animate,
  style,
  transition,
  trigger,
  query,
  stagger,
} from '@angular/animations';

import { PaymentService, Transaction } from '../../services/payment.service';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputMaskModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    ImageModule,
  ],
  animations: [
    trigger('pageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '0.6s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('cartItems', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateX(-20px)' }),
            stagger(100, [
              animate(
                '0.5s ease-out',
                style({ opacity: 1, transform: 'translateX(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('formFields', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '0.5s ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('cardTypeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'scale(0.8)' })),
      ]),
    ]),
  ],
})


export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  isProcessing: boolean = false;
  activeCardType: 'visa' | 'mastercard' | null = null;
  transaction: Transaction | null = null;

  subtotal: number = 0;
  tax: number = 0;
  totalAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private paymentService: PaymentService,
    private booksService: BookService,
    private router: Router
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.paymentForm = this.fb.group({
      cardNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/),
        ],
      ],
      cardName: ['', [Validators.required, Validators.minLength(3)]],
      expiryDate: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
        ],
      ],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });

    // Listen to card number changes to detect card type
    this.paymentForm
      .get('cardNumber')
      ?.valueChanges.subscribe((value: string) => {
        this.ngZone.run(() => {
          this.detectCardType(value);
          this.cdr.detectChanges();
        });
      });
  }

  ngOnInit() {
    console.log('Initializing PaymentComponent');
    this.paymentService.transaction$.subscribe({
        next: (transaction) => {
            console.log('Received transaction:', transaction);
            if (transaction) {
                this.transaction = transaction;
                this.calculateTotals(transaction);
                console.log('Updated transaction state:', this.transaction);
            }
        },
        error: (error) => {
            console.error('Error with transaction:', error);
        }
    });
  }

  private calculateTotals(transaction: Transaction): void {
    this.subtotal = transaction.amount;
    this.tax = this.subtotal * 0.1; // 10% tax
    this.totalAmount = this.subtotal + this.tax;
  }

  detectCardType(cardNumber: string): void {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.startsWith('4')) {
      this.activeCardType = 'visa';
    } else if (cleaned.startsWith('5')) {
      this.activeCardType = 'mastercard';
    } else {
      this.activeCardType = null;
    }
  }

  formatCardNumber(event: any): void {
    let input = event.target;
    let trimmed = input.value.replace(/\s+/g, '');
    if (trimmed.length > 16) {
      trimmed = trimmed.substr(0, 16);
    }

    let numbers = [];
    for (let i = 0; i < trimmed.length; i += 4) {
      numbers.push(trimmed.substr(i, 4));
    }
    input.value = numbers.join(' ');
  }

  formatExpiryDate(event: any): void {
    let input = event.target;
    let trimmed = input.value.replace(/\s+/g, '').replace('/', '');
    if (trimmed.length > 4) {
      trimmed = trimmed.substr(0, 4);
    }
    if (trimmed.length >= 2) {
      input.value = trimmed.substr(0, 2) + ' / ' + trimmed.substr(2);
    }
  }

  onSubmit(): void {
    if (!this.transaction) {
    console.error('Transaction or Book not loaded yet.');
    return;
    }

    console.log('Current transaction:', this.transaction);

    if (!this.transaction.bookid) {
      console.error('Book ID is missing from transaction');
      return;
    }

    if (this.paymentForm.invalid) {
        Object.keys(this.paymentForm.controls).forEach((key) => {
            const control = this.paymentForm.get(key);
            if (control?.invalid) {
                control.markAsTouched();
            }
        });
        return;
    }

    this.isProcessing = true;

    setTimeout(() => {
        this.ngZone.run(() => {
            try {
                if (this.transaction?.id && this.transaction.bookid) {
                    // Update transaction status
                    this.paymentService.updateTransactionStatus(this.transaction.id, 'succeeded')
                        .subscribe({
                            next: (updatedTransaction) => {
                              this.booksService.markBookAsSold(this.transaction!.bookid)
                                    .subscribe({
                                        next: () => {
                                            console.log('Book marked as sold successfully');
                                            this.router.navigate(['/books']);
                                        },
                                        error: (error) => {
                                            console.error('Error marking book as sold:', error);
                                        }
                                    });
                                this.transaction = updatedTransaction;                                
                            },
                            error: (error) => {
                                console.error('Error updating transaction:', error);
                                this.paymentService.updateTransactionStatus(this.transaction!.id, 'failed')
                                    .subscribe();
                            }
                        });
                }
            } catch (error) {
                if (this.transaction?.id) {
                    this.paymentService.updateTransactionStatus(this.transaction.id, 'failed')
                        .subscribe();
                }
                console.error('Payment processing error:', error);
            }
            
            this.isProcessing = false;
            this.cdr.detectChanges();
        });
    }, 1500);
  }

  getErrorMessage(controlName: string): string {
    const control = this.paymentForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['pattern']) {
        switch (controlName) {
          case 'cardNumber':
            return 'Please enter a valid card number';
          case 'cardName':
            return 'Please enter a valid name';
          case 'expiryDate':
            return 'Please enter a valid expiry date (MM/YY)';
          case 'cvc':
            return 'Please enter a valid CVC';
          default:
            return 'Invalid input';
        }
      }
      if (control.errors['minlength']) {
        return 'Must be at least 3 characters';
      }
    }
    return '';
  }
}
