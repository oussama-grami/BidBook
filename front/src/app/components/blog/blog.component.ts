import {Component, Input} from '@angular/core';
import {DatePipe, NgIf} from '@angular/common';
import {Article} from '../articlesPage/articleCard.component';
import {ArticleService} from '../../services/article.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-blog',
  imports: [
    DatePipe,
    NgIf
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  article!: Article;
  isAuthor :boolean = false;
  constructor(private articleService: ArticleService,
  private route:ActivatedRoute,
              private authService: AuthService,
              private router: Router,) {
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
    this.authService.getProfile().subscribe(data => {
      if(data.id === +this.article.author.id) {
        this.isAuthor = true;
      }
    })
  }

  onDeleteArticle() {
    this.articleService.deleteArticle(+this.article.id).subscribe({
      next: () => {
        console.log('Article deleted successfully');
        this.router.navigate(['/articles']); // Rediriger vers la liste des articles
      },
      error: (error) => {
        console.error('Error deleting article:', error);
      }
    });
  }

  onUpdateArticle() {
    this.router.navigate(['/articles/update', this.article.id]);
  }

}
