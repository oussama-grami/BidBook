// transaction-history.component.ts
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule,ReactiveFormsModule} from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {NgForOf} from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HistoryService, Transaction } from '../../services/history.service';
import { AuthService } from '../../services/auth.service';

// Angular Material Imports
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-transactions-history',
  imports: [
    NgForOf,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './transactions-history.component.html',
  styleUrl: './transactions-history.component.css'
})
export class TransactionsHistoryComponent implements OnInit {

  transactions: Transaction[] = [];
  filterForm: FormGroup;
  selectedPeriod: string = 'This week';
  periodOptions: string[] = ['Today', 'This week', 'This month', 'Previous month', 'This year'];
  statusOptions: string[] = ['Bought', 'Sold'];
  selectedStatus: string | null = null;

  startDate: Date = new Date('2025-01-01');
  endDate: Date = new Date();


  constructor(private fb: FormBuilder, private historyService: HistoryService) {
    this.filterForm = this.fb.group({
      period: ['This week'],
      startDate: [this.startDate],
      endDate: [this.endDate],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.historyService.transactions$.subscribe(
      transactions => {
        this.transactions = transactions;
      }
    );
    console.log('Transactions:', this.transactions);
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    this.filterForm.get('period')?.setValue(period);

    // Optionnel: définir automatiquement les dates en fonction de la période sélectionnée
    const today = new Date();

    switch(period) {
      case 'Today':
        this.startDate = new Date(today);
        this.endDate = new Date(today);
        break;
      case 'This week':
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        this.startDate = new Date(firstDayOfWeek);
        this.endDate = new Date(today);
        break;
      case 'This month':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.startDate = new Date(firstDayOfMonth);
        this.endDate = new Date(today);
        break;
      case 'Previous month':
        const firstDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        this.startDate = new Date(firstDayOfPrevMonth);
        this.endDate = new Date(lastDayOfPrevMonth);
        break;
      case 'This year':
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        this.startDate = new Date(firstDayOfYear);
        this.endDate = new Date(today);
        break;
    }

    this.filterForm.get('startDate')?.setValue(this.startDate);
    this.filterForm.get('endDate')?.setValue(this.endDate);
  }

  setStatus(status: string): void {
    if (this.selectedStatus === status) {
      this.selectedStatus = null;
    } else {
      this.selectedStatus = status;
    }
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.startDate = event.value;
    }
  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.endDate = event.value;
    }
  }

  formatDate(date: Date): string {
    return date ? `${date.getDate()} ${this.getMonthShortName(date.getMonth())} ${date.getFullYear()}` : '';
  }

  private getMonthShortName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
  }

  search(): void {
    console.log('Search with filters:', {
      period: this.selectedPeriod,
      dateRange: {
        start: this.formatDate(this.startDate),
        end: this.formatDate(this.endDate)
      },
      status: this.selectedStatus
    });

    // Ici vous pouvez implémenter la logique pour filtrer les transactions
    // En fonction des critères sélectionnés
  }
}
