import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {CategoryEnum} from '../../enums/category.enum';
import {ArticleService} from '../../services/article.service';
import {HttpClientModule, provideHttpClient} from '@angular/common/http';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-add-blog',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './add-blog.component.html',
  standalone: true,
  styleUrl: './add-blog.component.css'
})
export class AddBlogComponent {
  articleForm: FormGroup;
  categories: string[] = [CategoryEnum.FICTION, CategoryEnum.SCIENCE, CategoryEnum.TECHNOLOGY,CategoryEnum.TRAVEL, CategoryEnum.FOOD, CategoryEnum.LIFESTYLE,CategoryEnum.All];
  submitted = false;
  successMessage = '';
  authorId = 0;
  selectedFile: File | null = null;
  message = '';
  messageType: 'success' | 'error' | '' = '';


  constructor(private fb: FormBuilder, private articleService: ArticleService,
              private authService: AuthService,) {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      picture: ['', Validators.required],
      category: ['', Validators.required],
      content: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.authService.getProfile().subscribe(data => {
      this.authorId = data.id;
    })
  }
  get f() {
    return this.articleForm.controls;
  }

  submitArticle() {
    this.submitted = true;

    if (this.articleForm.valid && this.selectedFile) {
      const uploadData = new FormData();
      uploadData.append('file', this.selectedFile);

      this.articleService.uploadImage(uploadData).subscribe({
        next: (response: any) => {
          const imageUrl = response.imageUrl;
          const { title, category, content } = this.articleForm.value;

          const articleData = {
            title,
            category,
            content,
            pictureUrl: imageUrl,
            authorId: this.authorId
          };
          this.articleService.createArticle(articleData).subscribe({
            next: (res) => {
              this.successMessage = 'Article ajouté avec succès !';
              this.articleForm.reset();
              this.selectedFile = null;
              this.submitted = false;
              this.message = 'Article ajouté avec succès !';
              this.messageType = 'success';

              setTimeout(() => {
                this.message = '';
                this.messageType = '';
              }, 4000);
            },
            error: (err) => {
              console.error('Erreur lors de la création de l’article :', err);
              this.message = 'Erreur lors de la création de l’article';
              this.messageType = 'error';
              setTimeout(() => {
                this.message = '';
                this.messageType = '';
              }, 4000);
            }
          });
        },
        error: (uploadErr) => {
          console.error('Erreur lors de l’upload de l’image :', uploadErr);
        }
      });
    }
  }


  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }

  }
}
