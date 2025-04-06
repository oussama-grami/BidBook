import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';

interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  category: string;
}

@Component({
  selector: 'app-ebooks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    SidebarModule,
    MenuModule
  ],
  templateUrl: './ebooks.component.html',
  styleUrl: './ebooks.component.css'
})
export class EbooksComponent implements OnInit {
  books: Book[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverImage: 'https://covers.openlibrary.org/b/id/8759597-L.jpg',
      category: 'Fiction'
    },
    {
      id: 2,
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      coverImage: 'https://covers.openlibrary.org/b/id/9278726-L.jpg',
      category: 'Non-Fiction'
    },
    {
      id: 3,
      title: 'Brief Answers to the Big Questions',
      author: 'Stephen Hawking',
      coverImage: 'https://covers.openlibrary.org/b/id/10753662-L.jpg',
      category: 'Science'
    },
    {
      id: 4,
      title: 'The Innovators',
      author: 'Walter Isaacson',
      coverImage: 'https://covers.openlibrary.org/b/id/8231876-L.jpg',
      category: 'Technology'
    },
    {
      id: 5,
      title: 'A People\'s History of the United States',
      author: 'Howard Zinn',
      coverImage: 'https://covers.openlibrary.org/b/id/8430444-L.jpg',
      category: 'History'
    },
    {
      id: 6,
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      coverImage: 'https://covers.openlibrary.org/b/id/8231523-L.jpg',
      category: 'Fiction'
    }
  ];

  filteredBooks: Book[] = [];
  selectedCategory: string = 'All Books';
  isMobileMenuOpen: boolean = false;
  categories: MenuItem[] = [];

  ngOnInit() {
    this.filteredBooks = [...this.books];
    
    this.categories = [
      {
        label: 'All Books',
        command: () => this.onCategorySelect('All Books')
      },
      {
        label: 'Fiction',
        command: () => this.onCategorySelect('Fiction')
      },
      {
        label: 'Non-Fiction',
        command: () => this.onCategorySelect('Non-Fiction')
      },
      {
        label: 'Science',
        command: () => this.onCategorySelect('Science')
      },
      {
        label: 'Technology',
        command: () => this.onCategorySelect('Technology')
      },
      {
        label: 'History',
        command: () => this.onCategorySelect('History')
      }
    ];
  }

  onCategorySelect(category: string) {
    this.selectedCategory = category;
    if (category === 'All Books') {
      this.filteredBooks = [...this.books];
    } else {
      this.filteredBooks = this.books.filter(book => book.category === category);
    }
    
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    if (query.trim() === '') {
      this.onCategorySelect(this.selectedCategory);
      return;
    }
    
    this.filteredBooks = this.books.filter(book => 
      (this.selectedCategory === 'All Books' || book.category === this.selectedCategory) &&
      (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query))
    );
  }

  onRead(book: Book) {
    console.log('Reading book:', book.title);
  }

  onDownload(book: Book) {
    console.log('Downloading book:', book.title);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
