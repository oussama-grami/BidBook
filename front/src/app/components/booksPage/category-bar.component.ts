import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface Book {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  comments: number;
  daysAgo: number;
}

export type BookCategory =
  | 'Fiction'
  | 'Romance'
  | 'Thriller'
  | 'Fantasy'
  | 'Biography'
  | 'All';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="category-nav">
      <ul class="category-list">
        <li
          *ngFor="let category of categories"
          class="category-item"
          [class.active]="selectedCategory === category"
          (click)="onCategorySelect(category)"
        >
          {{ category }}
        </li>
      </ul>
    </nav>
  `,
  styles: [
    `
      .category-nav {
        margin-bottom: 40px;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }

      .category-list {
        display: flex;
        gap: 40px;
        list-style: none;
        padding: 0;
        margin: 0;
        justify-content: center;
      }

      .category-item {
        color: #384f6d;
        font-family: Poppins, sans-serif;
        font-size: 14px;
        cursor: pointer;
        transition: color 0.3s ease, border-bottom 0.3s ease;
      }

      .category-item.active {
        color: #9c7350;
        border-bottom: 1px solid #9c7350;
        padding-bottom: 5px;
      }

      @media (max-width: 640px) {
        .category-list {
          flex-wrap: wrap;
          gap: 20px;
        }
      }
    `,
  ],
})
export class CategoryListComponent {
  @Input() categories: BookCategory[] = [
    'Fiction',
    'Romance',
    'Thriller',
    'Fantasy',
    'Biography',
    'All',
  ];
  @Input() selectedCategory: BookCategory = 'All';
  @Output() categorySelected = new EventEmitter<BookCategory>();

  onCategorySelect(category: BookCategory): void {
    this.categorySelected.emit(category);
    this.selectedCategory = category;
  }
}
