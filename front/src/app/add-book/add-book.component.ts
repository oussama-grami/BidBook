import { Component, OnInit } from '@angular/core';
import { NgIf, NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  imports: [NgOptimizedImage, ReactiveFormsModule, NgIf],
  styleUrls: ['./add-book.component.css'],
  standalone: true,
})
export class AddBookComponent implements OnInit {
  addBookForm!: FormGroup;
  selectedFile: File | null = null;
  predictedPrice: number | null = null;

  constructor(private fb: FormBuilder) {}

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
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  predictPrice() {
    // This would typically call a service to predict the price based on the provided information
    // For now, we'll just set a dummy predicted price
    this.predictedPrice = 19.99;
    this.addBookForm.patchValue({ price: this.predictedPrice });
  }

  onSubmit() {
    if (this.addBookForm.valid) {
      const formData = new FormData();

      // Append form values to FormData
      Object.keys(this.addBookForm.value).forEach((key) => {
        formData.append(key, this.addBookForm.value[key]);
      });

      // Append the file if selected
      if (this.selectedFile) {
        formData.append('picture', this.selectedFile, this.selectedFile.name);
      }

      // Here you would typically send formData to your backend API
      console.log('Form submitted', this.addBookForm.value);
      console.log('Selected file:', this.selectedFile);
    }
  }
}
