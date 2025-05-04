import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import {CategoryEnum} from '../../enums/category.enum';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-update-blog',
  templateUrl: './update-blog.component.html',
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  styleUrls: ['./update-blog.component.css']
})
export class UpdateArticleComponent implements OnInit {
  updateForm!: FormGroup;
  articleId!: number;
  submitted:boolean = false;
  selectedFile!: File;
  article!: any;
  categories = Object.values(CategoryEnum);

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.articleId = +this.route.snapshot.paramMap.get('id')!;

    this.updateForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      pictureUrl: [''],
      category: ['', Validators.required],
    });

    this.loadArticle();
  }


  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  loadArticle() {
    this.articleService.getArticleById(this.articleId).subscribe(article => {
      this.article = article;
      this.updateForm.patchValue({
        title: article.title,
        content: article.content,
        pictureUrl: article.pictureUrl,
        category: article.category
      });
    });
  }
  onUpdate() {
    this.submitted = true;

    if (this.updateForm.valid) {
      const { title, category, content } = this.updateForm.value;

      if (this.selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', this.selectedFile);

        this.articleService.uploadImage(uploadData).subscribe({
          next: (response: any) => {
            const imageUrl = response.imageUrl;

            const updatedArticle = {
              title,
              category,
              content,
              pictureUrl: imageUrl
            };

            this.articleService.updateArticle(this.articleId, updatedArticle).subscribe({
              next: (res) => {
                this.router.navigate(['/articles']);
              },
              error: (err) => {
                console.error('Update failed', err);
              }
            });
          },
          error: (err) => {
            console.error('Image upload failed', err);
          }
        });

      } else {
        const updatedArticle = {
          title,
          category,
          content,
          pictureUrl: this.article.pictureUrl // garder l'ancienne image
        };

        this.articleService.updateArticle(this.articleId, updatedArticle).subscribe({
          next: (res) => {
            this.router.navigate(['/articles']);
          },
          error: (err) => {
            console.error('Update failed', err);
          }
        });
      }
    }
  }

}
