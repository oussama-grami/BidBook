// add-book.component.ts
import { Component, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { BookService } from '../../services/book.service';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { createApollo } from '../../../apollo.config';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageModule,
    ButtonModule,
    HttpClientModule,
  ],
  styleUrls: ['./add-book.component.css'],
  standalone: true
})
export class AddBookComponent implements OnInit {
  addBookForm!: FormGroup;
  selectedFile: File | null = null;
  predictedPrice: number | null = null;
  isPredicting = false;
  showPriceResult = false;
  priceAccepted = false;
  previewImage: string | null = null;
  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.addBookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      editor: ['', Validators.required],
      edition: ['', Validators.required],
      category: ['', Validators.required],
      language: ['', Validators.required],
      numberOfPages: ['', [Validators.required, Validators.min(1)]],
      damagedPages: ['', [Validators.min(0)]],
      age: ['', Validators.required],
      price: [
        { value: '', disabled: true },
        [Validators.required, Validators.min(0)],
      ],
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  predictPrice() {
    if (this.addBookForm.invalid) {
      this.markFormGroupTouched(this.addBookForm);
      return;
    }

    this.isPredicting = true;
    this.showPriceResult = false;

    // Map form fields to match backend DTO
    const bookData = {
      title: this.addBookForm.get('title')?.value,
      author: this.addBookForm.get('author')?.value,
      category: this.addBookForm.get('category')?.value,
      language: this.addBookForm.get('language')?.value,
      editor: this.addBookForm.get('editor')?.value,
      edition: Number(this.addBookForm.get('edition')?.value),
      totalPages: Number(this.addBookForm.get('numberOfPages')?.value),
      damagedPages: Number(this.addBookForm.get('damagedPages')?.value),
      age: Number(this.addBookForm.get('age')?.value),
    };

    this.bookService
      .predictBookPrice(bookData)
      .pipe(finalize(() => (this.isPredicting = false)))
      .subscribe({
        next: (response: any) => {
          this.predictedPrice = response.predictedPrice;
          this.showPriceResult = true;
          this.addBookForm.get('price')?.setValue(this.predictedPrice);
        },
        error: (error: any) => {
          console.error('Error predicting price:', error);
          this.showPriceResult = false;
        },
      });
  }

  onAcceptPrice() {
    this.showPriceResult = false;
    this.priceAccepted = true;
    this.addBookForm.get('price')?.enable();
  }

  onRefusePrice() {
    this.router.navigate(['/']);
  }

  onSubmit() {
    if (this.addBookForm.valid && this.priceAccepted) {
      this.isSubmitting = true;
      this.submitError = null;

      const formData = new FormData();

      // Map form field names to match the backend DTO
      formData.append('title', this.addBookForm.get('title')?.value);
      formData.append('author', this.addBookForm.get('author')?.value);
      formData.append('category', this.addBookForm.get('category')?.value);
      formData.append('language', this.addBookForm.get('language')?.value);
      formData.append('editor', this.addBookForm.get('editor')?.value);
      formData.append('edition', this.addBookForm.get('edition')?.value);
      formData.append(
        'totalPages',
        this.addBookForm.get('numberOfPages')?.value
      );
      formData.append(
        'damagedPages',
        this.addBookForm.get('damagedPages')?.value
      );
      formData.append('age', this.addBookForm.get('age')?.value);
      formData.append('price', this.addBookForm.get('price')?.value);

      if (this.selectedFile) {
        formData.append(
          'pictureFile',
          this.selectedFile,
          this.selectedFile.name
        );
      }
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      this.bookService
        .addBook(formData)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: (response: any) => {
            console.log('Book added successfully', response);
            this.router.navigate(['/books']); // Navigate to book list or appropriate page
          },
          error: (error: any) => {
            console.error('Error adding book:', error);
            this.submitError =
              error.message || 'Failed to add book. Please try again.';
          },
        });
    } else {
      this.markFormGroupTouched(this.addBookForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
