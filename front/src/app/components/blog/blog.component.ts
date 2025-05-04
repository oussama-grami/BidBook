import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Article} from '../articlesPage/articleCard.component';
import {ArticleService} from '../../services/article.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-blog',
  imports: [
    DatePipe
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  article: Article | undefined;

  constructor(private articleService: ArticleService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const articleId = Number(this.route.snapshot.paramMap.get('id'));

    this.articleService.getArticleById(articleId).subscribe({
      next: (article) => {
        console.log('Article récupéré :', article);
        this.article = article; // suppose que tu as une variable article dans ton composant
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l’article :', err);
      }
    });
  }

}
