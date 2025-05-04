import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ArticleService} from '../../services/article.service';

export interface Article {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  title: string;
  category: string;
  content: string;
  author: Author;
  pictureUrl: string;
}
export interface Author {
  id:string,
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  imageUrl: string;
  isMFAEnabled: boolean
}

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="article-card">
      <img [src]="article.pictureUrl" [alt]="article.title" class="card-image"/>
      <div class="card-content">
        <time class="article-date">{{ article.createdAt | date:'dd MMM yyyy'  }}</time>
        <h2 class="article-title">{{ article.title }}</h2>
        <span class="category-tag">{{ article.category }}</span>
        <p class="article-description">{{ article.content }}</p>
        <hr class="divider"/>
        <div class="card-footer">
          <span class="author-name">By {{ article.author.firstName + " " + article.author.lastName }}</span>
          <button
            [routerLink]="[article.id] "
            class="details-link">
            View details
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      .article-card {
        width: 350px;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }

      .article-card:hover {
        transform: translateY(-5px);
      }

      .card-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .card-content {
        padding: 20px;
      }

      .article-date {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .article-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #1f2937;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .category-tag {
        display: inline-block;
        padding: 4px 12px;
        background-color: #e5e7eb;
        border-radius: 15px;
        font-size: 12px;
        color: #4b5563;
        margin-bottom: 12px;
      }

      .article-description {
        color: #6b7280;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .author-name {
        font-size: 14px;
        color: #4b5563;
      }

      .details-link {
        color: #9c7350;
        font-family: Poppins;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
      }

      @media (max-width: 991px) {
        .article-card {
          width: 300px;
        }

        .card-image {
          height: 180px;
        }
      }

      @media (max-width: 768px) {
        .article-card {
          width: 100%;
          max-width: 450px;
        }

        .card-image {
          height: 220px;
        }
      }

      @media (max-width: 480px) {
        .card-content {
          padding: 15px;
        }

        .card-image {
          height: 180px;
        }

        .article-title {
          font-size: 16px;
        }

        .article-description {
          font-size: 13px;
          -webkit-line-clamp: 2;
        }
      }
    `,
  ],
})
export class ArticleCardComponent {
  @Input() article!: Article;
  author: Author | undefined
  constructor(private articleService: ArticleService,) {
  }

  ngOnInit() {
  }
}
