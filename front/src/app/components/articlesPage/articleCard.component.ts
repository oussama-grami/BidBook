import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

interface Article {
  date: string;
  title: string;
  category: string;
  description: string;
  author: string;
  imageUrl: string;
}

@Component({
  selector: "app-article-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="article-card">
      <img [src]="article.imageUrl" [alt]="article.title" class="card-image" />
      <div class="card-content">
        <time class="article-date">{{ article.date }}</time>
        <h2 class="article-title">{{ article.title }}</h2>
        <span class="category-tag">{{ article.category }}</span>
        <p class="article-description">{{ article.description }}</p>
        <hr class="divider" />
        <div class="card-footer">
          <span class="author-name">By {{ article.author }}</span>
          <button class="details-link">View details</button>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      .article-card {
        width: 310px;
        border: 4px solid #50719c;
        border-radius: 5px;
        overflow: hidden;
      }

      .card-image {
        width: 100%;
        height: 208px;
        object-fit: cover;
      }

      .card-content {
        padding: 20px;
      }

      .article-date {
        display: block;
        color: #6c757d;
        font-family: Lora;
        font-size: 12px;
        margin-bottom: 15px;
      }

      .article-title {
        color: #495057;
        font-family: Poppins;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 15px;
      }

      .category-tag {
        display: inline-block;
        padding: 5px 10px;
        color: #fff;
        font-family: Poppins;
        font-size: 10px;
        font-weight: 700;
        border-radius: 8px;
        margin-bottom: 15px;
        background-color: #9c7350;
      }

      .article-description {
        color: #6c757d;
        font-family: Poppins;
        font-size: 12px;
        line-height: 20px;
        margin-bottom: 20px;
      }

      .divider {
        height: 1px;
        margin: 20px 0;
        background-color: #e5e5e5;
        border: none;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .author-name {
        color: #495057;
        font-family: Poppins;
        font-size: 12px;
        font-weight: 700;
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

      @media (max-width: 640px) {
        .article-card {
          width: 100%;
        }
      }
    `,
  ],
})
export class ArticleCardComponent {
  @Input() article!: Article;
}
