import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-add-blog',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.css'
})
export class AddBlogComponent {
  articleForm: FormGroup;
  categories: string[] = ['Fiction', 'Science', 'Technology', 'Travel', 'Food', 'Lifestyle'];
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      picture: ['', Validators.required],
      category: ['', Validators.required],
      text: ['', Validators.required]
    });
  }

  // Getter for easy access to form fields
  get f() {
    return this.articleForm.controls;
  }

  submitArticle() {
    this.submitted = true;

    if (this.articleForm.valid) {
      console.log('Article submitted:', this.articleForm.value);
      // Ici vous pouvez ajouter la logique pour envoyer les données au backend
    }
    // Les erreurs seront affichées automatiquement grâce au flag submitted
  }
}
