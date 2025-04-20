import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CategoryListComponent,} from '../booksPage/category-bar.component';
import {Article, ArticleCardComponent} from './articleCard.component';
import {RouterLink} from '@angular/router';
import {ArticleService} from '../../services/article.service';
import {CategoryEnum} from '../../enums/category.enum';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent, CategoryListComponent, RouterLink],
  template: `
    <main class="main-content">
      <app-category-list
        [selectedCategory]="selectedCategory"
        (categorySelected)="onCategoryChange($event)"
        (searchChanged)="onSearchChange($event)"
      />
      <div class="articles-grid">
        <app-article-card
          *ngFor="let article of filteredArticles"
          [article]="article"
        />
      </div>
      <div *ngIf="filteredArticles.length === 0" class="no-results">
        No articles found matching your criteria
      </div>
      <button class="add-article-btn" [routerLink]="['add']">Add article</button>
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
        flex-wrap: wrap;
        gap: 40px;
        margin-top: 30px;
        justify-content: center;
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
        position: fixed;
        right: 30px;
        bottom: 30px;
        z-index: 100;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .add-article-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(80, 113, 156, 0.3);
      }

      .no-results {
        text-align: center;
        color: #6b7280;
        font-size: 16px;
        margin-top: 40px;
        width: 100%;
      }

      @media (max-width: 991px) {
        .main-content {
          padding: 20px 20px 80px;
        }

        .articles-grid {
          gap: 30px;
        }
      }

      @media (max-width: 768px) {
        .articles-grid {
          gap: 20px;
        }

        .add-article-btn {
          right: 20px;
          bottom: 20px;
        }
      }

      @media (max-width: 480px) {
        .main-content {
          padding: 15px 15px 70px;
        }

        .articles-grid {
          gap: 15px;
        }

        .add-article-btn {
          padding: 8px 16px;
          font-size: 13px;
          right: 15px;
          bottom: 15px;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  selectedCategory: CategoryEnum = CategoryEnum.All;
  searchTerm = '';

  allArticles: Article[] = [];
  constructor(private articleService: ArticleService) {

  }

  filteredArticles: Article[] = [];

  ngOnInit() {
    this.articleService.getAllArticles().subscribe((articles: Article[]) => {this.allArticles = articles;
      this.applyFilters();
    console.log(articles)})
  }

  onCategoryChange(category: CategoryEnum) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  private applyFilters() {
    let results = [...this.allArticles];

    // Apply category filter
    if (this.selectedCategory !== CategoryEnum.All && this.selectedCategory !== null) {
      results = results.filter(
        (article) => article.category === this.selectedCategory
      );
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      results = results.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower)
          || article.author.lastName.toLowerCase().includes(searchLower) ||
          article.author.firstName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredArticles = results;
  }
}
