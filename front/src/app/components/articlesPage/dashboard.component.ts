import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryListComponent } from '../booksPage/category-bar.component';
import { ArticleCardComponent } from './articleCard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ArticleCardComponent,
    CategoryListComponent,
    ArticleCardComponent,
  ],
  template: `
    <main class="main-content">
      <app-category-list />
      <div class="articles-grid">
        <app-article-card
          *ngFor="let article of articles"
          [article]="article"
        />
      </div>
      <button class="add-article-btn">Add article</button>
    </main>
  `,
  styles: [
    `
      .main-content {
        flex: 1;
        position: relative;
        padding: 30px 40px 60px;
      }

      .articles-grid {
        display: flex;
        gap: 40px;
        margin-top: 60px;
      }

      .add-article-btn {
        color: #fff;
        font-family: Poppins;
        font-size: 14px;
        padding: 10px 20px;
        border-radius: 20px;
        border: none;
        cursor: pointer;
        background-color: #50719c;
        position: absolute;
        right: 10px;
        bottom: 10px;
      }

      @media (max-width: 991px) {
        .articles-grid {
          flex-wrap: wrap;
          justify-content: center;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  articles = [
    {
      date: '04.04.2025',
      title: 'The Timeless Appeal of Fiction Books',
      category: 'Fiction',
      description:
        'Fiction books have the power to transport readers to new worlds, introduce them to unforgettable characters, and evoke deep emotions.',
      author: 'Hiba Chabbouh',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/65b631fa4140af2d36a9f1925933b44cb4b5e3ff',
    },
    {
      date: '04.04.2025',
      title: 'The Timeless Appeal of Fiction Books',
      category: 'Fiction',
      description:
        'Fiction books have the power to transport readers to new worlds, introduce them to unforgettable characters, and evoke deep emotions.',
      author: 'Hiba Chabbouh',
      imageUrl:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/65b631fa4140af2d36a9f1925933b44cb4b5e3ff',
    },
  ];
}
