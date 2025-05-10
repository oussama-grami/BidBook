// book-update.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  language: string;
  editor: string;
  edition: string;
  totalPages: number;
  damagedPages: number;
  age: number;
  ownerId: number;
  price: number;
  picture?: string;
}

enum Category {
  FICTION = 'FICTION',
  NON_FICTION = 'NON_FICTION',
  SCIENCE = 'SCIENCE',
  HISTORY = 'HISTORY',
  BIOGRAPHY = 'BIOGRAPHY',
  ROMANCE = 'ROMANCE',
  OTHER = 'OTHER',
  ADVENTURE = 'ADVENTURE',
  FANTASY = 'FANTASY',
  POETRY = 'POETRY',
  ART = 'ART',
  NOVEL = 'NOVEL',
  THRILLER = 'THRILLER',
  PHILOSOPHY = 'PHILOSOPHY',
  RELIGION = 'RELIGION',
  TECHNOLOGY = 'TECHNOLOGY',
}

enum Language {
  ENGLISH = 'ENGLISH',
  GERMAN = 'GERMAN',
  FRENCH = 'FRENCH',
  ITALIAN = 'ITALIAN',
  SPANISH = 'SPANISH',
  OTHER = 'OTHER',
}

// Custom validator function for year format (4-digit integer)
function yearValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Allow empty values if not strictly required
  }
  const yearRegex = /^\d{4}$/;
  return yearRegex.test(control.value) ? null : { invalidYear: true };
}

// Custom validator function to compare damagedPages and totalPages
function damagedPagesValidator(formGroup: FormGroup): ValidationErrors | null {
  const totalPagesControl = formGroup.get('totalPages');
  const damagedPagesControl = formGroup.get('damagedPages');

  if (totalPagesControl && damagedPagesControl) {
    const totalPages = Number(totalPagesControl.value);
    const damagedPages = Number(damagedPagesControl.value);

    if (!isNaN(totalPages) && !isNaN(damagedPages) && damagedPages > totalPages) {
      return { damagedPagesTooHigh: true };
    }
  }

  return null;
}

@Component({
  selector: 'app-book-update',
  templateUrl: './book-update.component.html',
  styleUrls: ['./book-update.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class BookUpdateComponent implements OnInit {
  bookForm: FormGroup;
  bookId: number;
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  apiUrl = 'http://localhost:3000/books';

  categories = Object.values(Category);
  languages = Object.values(Language);
  predictingPrice = false;
  predictedPrice: number | null = null;
  showPriceConfirmation = false;
  originalBook: Book | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.bookId = 0;
    this.bookForm = this.fb.group({
      title: [''],
      author: [''],
      category: [''],
      language: [''],
      editor: [''],
      edition: ['', [yearValidator]], // Apply year validator
      totalPages: ['', [Validators.min(1)]],
      damagedPages: ['', [Validators.min(0)]],
      age: [''],
      ownerId: [''],
    }, { validators: damagedPagesValidator }); // Apply damagedPages validator to the form group
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.bookId = +params['id'];
      this.loadBookDetails();
    });
  }

  loadBookDetails(): void {
    this.loading = true;
    this.http.get<Book>(`${this.apiUrl}/${this.bookId}`).subscribe({
      next: (book) => {
        this.originalBook = book;
        this.bookForm.patchValue({
          title: book.title,
          author: book.author,
          category: book.category,
          language: book.language,
          editor: book.editor,
          edition: book.edition,
          totalPages: book.totalPages,
          damagedPages: book.damagedPages,
          age: book.age,
          ownerId: book.ownerId,
        });
        this.bookForm.get('ownerId')?.disable();
        if (book.picture) {
          this.imagePreview = book.picture.startsWith('http')
            ? book.picture
            : `http://localhost:3000/${book.picture}`;
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = `Failed to load book: ${error.message}`;
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.predictPriceAndConfirm();
    } else {
      this.markFormGroupTouched(this.bookForm);
    }
  }

  predictPriceAndConfirm(): void {
    this.predictingPrice = true;
    this.errorMessage = '';
    this.predictedPrice = null;
    this.showPriceConfirmation = false;

    const formData = new FormData();
    const currentFormValue = this.bookForm.value;

    Object.keys(currentFormValue).forEach((key) => {
      if (currentFormValue[key] !== null && currentFormValue[key] !== '') {
        formData.append(key, currentFormValue[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('pictureFile', this.selectedFile);
    }

    this.http
      .patch<Book>(`${this.apiUrl}/update/${this.bookId}`, formData)
      .subscribe({
        next: (updatedBook) => {
          this.predictedPrice = updatedBook.price;
          this.showPriceConfirmation = true;
          this.predictingPrice = false;
        },
        error: (error) => {
          this.errorMessage = `Failed to predict price: ${error.message}`;
          this.predictingPrice = false;
        },
      });
  }

  confirmUpdate(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showPriceConfirmation = false;

    const formData = new FormData();
    const currentFormValue = this.bookForm.value;

    Object.keys(currentFormValue).forEach((key) => {
      if (this.bookForm.get(key)?.dirty && currentFormValue[key] !== null && currentFormValue[key] !== '') {
        formData.append(key, currentFormValue[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('pictureFile', this.selectedFile);
    }

    this.http
      .patch<Book>(`${this.apiUrl}/update/${this.bookId}`, formData)
      .subscribe({
        next: (updatedBook) => {
          this.successMessage = 'Book updated successfully';
          this.loading = false;
          this.bookForm.markAsPristine();
          if (updatedBook.picture) {
            this.imagePreview = updatedBook.picture.startsWith('http')
              ? updatedBook.picture
              : `http://localhost:3000/${updatedBook.picture.replace(/^\.\//, '')}`;
          }
        },
        error: (error) => {
          this.errorMessage = `Failed to update book: ${error.message}`;
          this.loading = false;
        },
      });
  }

  refuseUpdate(): void {
    this.showPriceConfirmation = false;
    this.predictedPrice = null;
    this.errorMessage = 'Update cancelled by user.';
    // Optionally, revert the form to the original values
    if (this.originalBook) {
      this.bookForm.patchValue({
        title: this.originalBook.title,
        author: this.originalBook.author,
        category: this.originalBook.category,
        language: this.originalBook.language,
        editor: this.originalBook.editor,
        edition: this.originalBook.edition,
        totalPages: this.originalBook.totalPages,
        damagedPages: this.originalBook.damagedPages,
        age: this.originalBook.age,
        ownerId: this.originalBook.ownerId,
      });
      this.bookForm.markAsPristine();
      this.selectedFile = null;
      this.loadBookDetails();
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
