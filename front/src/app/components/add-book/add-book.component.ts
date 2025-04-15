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

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  imports: [CommonModule, ReactiveFormsModule, ImageModule, ButtonModule],
  styleUrls: ['./add-book.component.css'],
  standalone: true,
})
export class AddBookComponent implements OnInit {
  addBookForm!: FormGroup;
  selectedFile: File | null = null;
  predictedPrice: number | null = null;
  isPredicting = false;
  showPriceResult = false;
  priceAccepted = false;
  previewImage: string | null = null;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.addBookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      category: ['', Validators.required],
      numberOfPages: ['', [Validators.required, Validators.min(1)]],
      age: ['', Validators.required],
      edition: ['', Validators.required],
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

  async predictPrice() {
    this.isPredicting = true;
    this.showPriceResult = false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.predictedPrice = Math.floor(Math.random() * 50) + 20;
      this.showPriceResult = true;
      this.addBookForm.get('price')?.setValue(this.predictedPrice);
    } catch (error) {
      console.error('Error predicting price:', error);
    } finally {
      this.isPredicting = false;
    }
  }

  onAcceptPrice() {
    this.showPriceResult = false;
    this.priceAccepted = true;
    this.addBookForm.get('price')?.disable();
  }

  onRefusePrice() {
    this.router.navigate(['/']);
  }

  onSubmit() {
    if (this.addBookForm.valid && this.priceAccepted) {
      const formData = new FormData();

      Object.keys(this.addBookForm.value).forEach((key) => {
        formData.append(key, this.addBookForm.getRawValue()[key]);
      });

      if (this.selectedFile) {
        formData.append('picture', this.selectedFile, this.selectedFile.name);
      }

      console.log('Form submitted', this.addBookForm.getRawValue());
      console.log('Selected file:', this.selectedFile);
    }
  }
}
